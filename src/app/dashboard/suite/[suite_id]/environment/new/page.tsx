"use client";
import React, { useState, useContext, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Table, message, Input, Form, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { createEnvironmentAPI, CreateEnvironmentRequest } from "@/lib/apis/testAI/environments";
import { extractErrorMessage } from "@/lib/utils";
import MaxWidthWrapper from "@/components/MaxWidthWrapper/MaxWidthWrapper";
import type { GetRef, InputRef, TableProps } from "antd";

type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: string;
  record: any;
  handleSave: (record: any) => void;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingInlineEnd: 24, cursor: 'pointer' }}
        onClick={toggleEdit}
      >
        {children || <span style={{ color: '#999', fontStyle: 'italic' }}>Click to edit</span>}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

export default function NewEnvironmentPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const suite_id = params?.suite_id as string;
  
  const [envName, setEnvName] = useState("");
  const [envVariables, setEnvVariables] = useState<Array<{key: string, value: string, id: string}>>([{key: "", value: "", id: "var_0"}]);
  const [creating, setCreating] = useState(false);
  const [count, setCount] = useState(1);

  const handleCreate = async () => {
    try {
      setCreating(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        message.error("Authentication required");
        return;
      }

      if (!envName.trim()) {
        message.error("Please enter an environment name");
        return;
      }

      // Filter out empty key-value pairs and ensure all values are strings
      const validVariables = envVariables.filter(v => 
        v.key && v.value && 
        v.key.trim() !== "" && v.value.trim() !== ""
      );
      
      if (validVariables.length === 0) {
        message.error("Please add at least one environment variable");
        return;
      }

      // Convert array to object format, ensuring all values are strings
      const variablesObject: { [key: string]: string } = {};
      validVariables.forEach(variable => {
        // Ensure both key and value are strings and not undefined/null
        const key = String(variable.key || "").trim();
        const value = String(variable.value || "").trim();
        if (key && value) {
          variablesObject[key] = value;
        }
      });

      const environmentData: CreateEnvironmentRequest = {
        environment_name: envName.trim(),
        suite_id: suite_id,
        variables: variablesObject
      };

      const response = await createEnvironmentAPI(token, environmentData);
      if (response.status === 200 || response.status === 201) {
        message.success("Environment created successfully");
        
        // Notify parent page that environment was created
        localStorage.setItem('environmentCreated', JSON.stringify({
          suiteId: suite_id,
          timestamp: Date.now()
        }));
        
        // Close the tab if it was opened in a new tab
        if (window.opener) {
          window.close();
        } else {
          router.push(`/dashboard/suite/${suite_id}`);
        }
      } else {
        message.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      message.error(extractErrorMessage(error));
    } finally {
      setCreating(false);
    }
  };

  const handleAddVariable = () => {
    const newVariable = {
      key: "",
      value: "",
      id: `var_${count}`
    };
    setEnvVariables([...envVariables, newVariable]);
    setCount(count + 1);
  };

  const handleDelete = (id: string) => {
    if (envVariables.length > 1) {
      const newData = envVariables.filter((item) => item.id !== id);
      setEnvVariables(newData);
    }
  };

  const handleSave = (row: any) => {
    const newData = [...envVariables];
    const index = newData.findIndex((item) => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setEnvVariables(newData);
  };

  const defaultColumns: any[] = [
    {
      title: "Key",
      dataIndex: "key",
      width: "40%",
      editable: true,
    },
    {
      title: "Value",
      dataIndex: "value",
      width: "40%",
      editable: true,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      width: "20%",
      render: (_: any, record: any) =>
        envVariables.length >= 1 ? (
          <Button onClick={()=>handleDelete(record.id)} size="small" className="text-[#EA3962] border-none hover:!text-[#EA3962] hover:!bg-transparent" data-testid="env-delete-variable-button">Delete</Button>
        ) : null,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  return (
    <>
      <style jsx global>{`
        .editable-cell-value-wrap {
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s;
          min-height: 32px;
          display: flex;
          align-items: center;
          min-width: 100px;
        }
        .editable-cell-value-wrap:hover {
          background-color: #f5f5f5;
        }
        .editable-row:hover .editable-cell-value-wrap {
          background-color: #f5f5f5;
        }
        .editable-cell-value-wrap:empty::before {
          content: "Click to edit";
          color: #999;
          font-style: italic;
        }
      `}</style>
      <MaxWidthWrapper className="py-4 px-3.5 md:px-20">
      <div className="w-full p-4 bg-white rounded-md mb-5" data-testid="env-create-form">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(`/dashboard/suite/${suite_id}`)}
              className="font-hanken"
            >
              Back to Suite
            </Button> */}
            <span className="font-hanken font-weight-h text-h-3 text-[#4542CC]" data-testid="env-create-title">
              Create New Environment
            </span>
          </div>
        </div>

        <div className="flex gap-5 mt-5 items-center" data-testid="env-name-section">
          <div className="flex flex-col font-hanken font-weight-h gap-3 text-[#666666]">
            <div>Environment Name</div>
          </div>
          <div className="flex flex-col font-hanken gap-3 text-[#333333]">
            <Input
              value={envName}
              onChange={(e) => setEnvName(e.target.value)}
              placeholder="Enter environment name"
              className="font-hanken"
              style={{ width: 300 }}
              data-testid="env-name-input"
            />
          </div>
        </div>
      </div>

      <div className="w-full p-4 bg-white rounded-md mb-5" data-testid="env-variables-section">
        <div className="flex items-center justify-between mb-4">
          <span className="font-hanken font-weight-h text-h-3 text-[#4542CC]" data-testid="env-variables-title">
            Environment Variables
          </span>
        
        </div>
        
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered={false}
          dataSource={envVariables}
          columns={columns}
          pagination={false}
          size="small"
          className="font-hanken"
          rowKey={(record, index) => record?.id ?? `env-var-${index}`}
          showHeader={true}
          data-testid="env-variables-table"
          locale={{
            emptyText: (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg font-hanken">No variables defined</p>
                <p className="text-sm">Click &quot;Add Variable&quot; to get started</p>
              </div>
            ),
          }}
        />
        
        <div className="flex justify-end items-center mt-4 pt-4">
          <Button
            type="primary"
            onClick={handleAddVariable}
            className="font-hanken bg-[#AE00FF] border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
            data-testid="env-add-variable-button"
          >
            Add Variable
          </Button>
        </div>
      </div>

      <div className="w-full p-4 bg-white rounded-md mb-5" data-testid="env-create-actions">
        <div className="flex justify-end gap-2">
         
          <Button
            type="primary"
            onClick={handleCreate}
            loading={creating}
            className="font-hanken bg-[#AE00FF] border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
            data-testid="env-create-button"
          >
            Create Environment
          </Button>
        </div>
      </div>
    </MaxWidthWrapper>
    </>
  );
}
