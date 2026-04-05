import * as React from "react";
import { Button, Modal, Input, Select, message, Tooltip } from "antd";
import { PlusOutlined, CopyOutlined, CloseOutlined } from '@ant-design/icons';
import { createKeyAPI } from "@/lib/apis/documentAI/apiKey";
import { useAuth } from "@/contexts/AuthContext";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoleBasedButton } from "../ui/role-based-button";
const { Option } = Select;

export default function CreateKey({ onKeyCreated }: { onKeyCreated?: () => void }) {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [validity, setValidity] = useState("");
  const [expiry, setExpiry] = useState<string | null>(null);
  const [createKeyResponse, setCreateKeyResponse] = useState<any>(null);
  const [keyName, setKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const textRef = useRef<any>(null);

  useEffect(() => {
    if (validity === "Tomorrow") {
      setExpiry(getTomorrowsDate());
    } else if (validity === '1 Week') {
      setExpiry(getDateOneWeekFromNow());
    } else if (validity === '1 Month') {
      setExpiry(getDateOneMonthFromNow());
    } else if (validity === '1 Year') {
      setExpiry(getDateOneYearFromNow());
    }
  }, [validity]);

  const router = useRouter();

  function getTomorrowsDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const day = String(tomorrow.getDate()).padStart(2, '0');
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const year = tomorrow.getFullYear();

    return `${year}-${month}-${day}`;
  }

  function getDateOneWeekFromNow() {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const day = String(nextWeek.getDate()).padStart(2, '0');
    const month = String(nextWeek.getMonth() + 1).padStart(2, '0');
    const year = nextWeek.getFullYear();

    return `${year}-${month}-${day}`;
  }

  function getDateOneMonthFromNow() {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    const day = String(nextMonth.getDate()).padStart(2, '0');
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0');
    const year = nextMonth.getFullYear();

    return `${year}-${month}-${day}`;
  }

  function getDateOneYearFromNow() {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    const day = String(nextYear.getDate()).padStart(2, '0');
    const month = String(nextYear.getMonth() + 1).padStart(2, '0');
    const year = nextYear.getFullYear();

    return `${year}-${month}-${day}`;
  }

  async function createAPIKey(name: string) {
    setIsCreating(true);
    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
      setIsCreating(false);
      return;
    }
    try {
      const response = await createKeyAPI(token, {
        apikey_name: name,
        apikey_expiry: expiry
      });

      if (response.status === 200) {
        setCreateKeyResponse(response.data);
        message.success("API key created successfully");
        // Call the callback to refresh the API keys list
        if (onKeyCreated) {
          onKeyCreated();
        }
      } else {
        message.error("There was an error");
      }
    } catch (error: any) {
      message.error(error);
    } finally {
      setIsCreating(false);
    }
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setValidity("");
    setExpiry(null);
    setCreateKeyResponse(null);
    setKeyName("");
  };

  const handleCopyText = () => {
    const text = textRef.current.innerText;
    navigator.clipboard.writeText(text).then(() => {
      message.success('Key copied to clipboard!');
    }).catch((err) => {
      message.error('Failed to copy key');
    });
  };

  const handleSubmit = () => {
    if (!keyName.trim()) {
      message.error('Please enter a key name');
      return;
    }
    if (!validity) {
      message.error('Please select validity');
      return;
    }
    createAPIKey(keyName);
  };

  return (
    <React.Fragment>
      <RoleBasedButton 
        className="!bg-[#AE00FF] hover:!bg-[#AE00FF] hover:!text-white !text-white !border-[#AE00FF] font-hanken flex items-center gap-2"
        onClick={handleClickOpen}
      >
        Create key
      </RoleBasedButton>
      <Modal
        open={open}
        onCancel={handleClose}
        title={
          <div className="flex justify-between items-center">
            <span className="font-hanken font-weight-h">Create key</span>
          
          </div>
        }
        footer={[
          <Button key="cancel" onClick={handleClose}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            className="bg-[#AE00FF] hover:!bg-[#AE00FF] border-[#AE00FF] font-hanken"
            disabled={createKeyResponse}
            loading={isCreating}
            onClick={handleSubmit}
          >
            Create
          </Button>
        ]}
        width={500}
      >
        <div className="space-y-4">
          <div>
            <label className="font-hanken text-sm text-[#666666] mb-2 block">Key Name</label>
            <Input
              disabled={createKeyResponse}
              placeholder="Enter key name"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              className="font-hanken"
            />
          </div>
          <div>
            <label className="font-hanken text-sm text-[#666666] mb-2 block">Validity</label>
            <Select
              disabled={createKeyResponse}
              placeholder="Select validity"
              value={validity}
              onChange={setValidity}
              className="w-full font-hanken"
            >
              <Option value="Tomorrow">Tomorrow</Option>
              <Option value="1 Week">1 Week</Option>
              <Option value="1 Month">1 Month</Option>
              <Option value="1 Year">1 Year</Option>
            </Select>
          </div>
          {createKeyResponse && (
            <div className="mt-4 p-3 bg-[#F8F8FF] rounded-md">
              <div className="font-hanken text-sm text-[#666666] mb-2">Your key</div>
              <div className="flex items-center justify-between">
                <div ref={textRef} className="font-weight-h font-hanken text-[#333333]">
                  {createKeyResponse?.apikey?.apikey_key}
                </div>
                <Tooltip title="Copy API key">
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={handleCopyText}
                    className="text-[#AE00FF] hover:!text-[#AE00FF]"
                  />
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </React.Fragment>
  );
}
