"use client";
import Header from "@/components/AgentHeader/Header";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { message, Spin, Table, Button, Modal, Input, Select, Space } from "antd";
import { PlusOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons";
import MaxWidthWrapper from "@/components/MaxWidthWrapper/MaxWidthWrapper";
import { updateOrgAPI, fetchAllOrgsAPI, getCreditsAPI, updateCreditsAPI, getParallelExecutionsAPI, updateParallelExecutionsAPI } from "@/lib/apis/documentAI/org";
import { extractErrorMessage } from "@/lib/utils";

const { Option } = Select;

export default function OrganisationPage() {
  const { getToken } = useAuth();

  useEffect(() => {
    document.title = "Admin - Litmus Check";
  }, []);
  const router = useRouter();
  const [getOrgsLoading, setGetOrgsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [orgs, setOrgs] = useState<any>(null);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [aiCreditsToAdd, setAiCreditsToAdd] = useState("");
  const [browserMinutesToAdd, setBrowserMinutesToAdd] = useState("");
  const [currentCredits, setCurrentCredits] = useState<any>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [clickedOrg, setClickedOrg] = useState<any>(null);
  const [currentParallelExecutions, setCurrentParallelExecutions] = useState<any>(null);
  const [parallelExecutionsLoading, setParallelExecutionsLoading] = useState(false);
  const [parallelExecutionsOpen, setParallelExecutionsOpen] = useState(false);
  const [newParallelExecutions, setNewParallelExecutions] = useState(0);

  const handleClose = () => {
    if (creditsOpen) {
      setCreditsOpen(false);
      setAiCreditsToAdd("");
      setBrowserMinutesToAdd("");
    }
    if (parallelExecutionsOpen) {
      setParallelExecutionsOpen(false);
      setNewParallelExecutions(0);
    }
    if (editOpen) setEditOpen(false);
  };

  async function getAllOrgs() {
    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
    }
    try {
      const response = await fetchAllOrgsAPI(token);

      if (response.status === 200) {
        setOrgs(response.data);
        setGetOrgsLoading(false);
      } else {
        setGetOrgsLoading(false);
        message.error("There was an error");
      }
    } catch (error: any) {
      setGetOrgsLoading(false);
      message.error(error);
    }
  }

  useEffect(() => {
    getAllOrgs();
  }, []);

  const handleEditClick = (org: any) => {
    setClickedOrg(org);
    setEditOpen(true);
  };

  const handleSaveEdit = async (orgId: string, payload: any) => {
    setLoading(true);
    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
    }
    try {
      const response = await updateOrgAPI(token, orgId, payload);
      
      if (response.status === 200) {
        setLoading(false);
        message.success(`Organization ${clickedOrg.org_name} updated successfully`);
        handleClose();
        getAllOrgs();
      } else {
        setLoading(false);
        message.error("There was an error");
      }
    } catch (error: any) {
      setLoading(false);
      message.error(error);
    }
  };

  const handleCreditsClick = async (org: any) => {
    setClickedOrg(org);
    setCreditsLoading(true);
    setCreditsOpen(true);
    
    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
      return;
    }
    
    try {
      const response = await getCreditsAPI(token, org.org_id);
      
      if (response.status === 200) {
        setCurrentCredits(response.data);
        setAiCreditsToAdd("");
        setBrowserMinutesToAdd("");
        setCreditsLoading(false);
      } else {
        setCreditsLoading(false);
      }
    } catch (error: any) {
      setCreditsLoading(false);
      message.error(error || "Failed to fetch credits");
    }
  };

  const handleAddCredits = async (payload: any) => {
    setLoading(true);
    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
    }
    try {
      const response = await updateCreditsAPI(token, clickedOrg.org_id, payload);
      
      if (response.status === 200) {
        setLoading(false);
        message.success(`Credits updated for ${clickedOrg.org_name} successfully`);
        setAiCreditsToAdd("");
        setBrowserMinutesToAdd("");
        setCurrentCredits(null);
        handleClose();
        getAllOrgs();
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
      message.error(error || "Failed to add credits");
    }
  };

  const handleParallelExecutionsClick = async (org: any) => {
    setClickedOrg(org);
    setParallelExecutionsLoading(true);
    setParallelExecutionsOpen(true);
    
    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
      return;
    }
    
    try {
      const response = await getParallelExecutionsAPI(token, org.org_id);
      
      if (response.status === 200) {
        setCurrentParallelExecutions(response.data);
        const currentValue = response.data.rate_limit ?? 0;
        setNewParallelExecutions(parseInt(currentValue));
        setParallelExecutionsLoading(false);
      } else {
        setParallelExecutionsLoading(false);
      }
    } catch (error: any) {
      setParallelExecutionsLoading(false);
      message.error(error || "Failed to fetch parallel executions");
    }
  };

  const handleUpdateParallelExecutions = async (payload: any) => {
    setLoading(true);
    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
    }
    try {
      const response = await updateParallelExecutionsAPI(token, clickedOrg.org_id, payload);
      
      if (response.status === 200) {
        setLoading(false);
        message.success(`Parallel executions updated for ${clickedOrg.org_name} successfully`);
        setCurrentParallelExecutions(null);
        setNewParallelExecutions(0);
        handleClose();
        getAllOrgs();
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
      message.error(error || "Failed to update parallel executions");
    }
  };

  const columns = [
    {
      title: <span className="font-hanken font-weight-h">ID</span>,
      dataIndex: 'org_id',
      key: 'org_id',
      render: (text: string) => <span className="font-hanken">{text}</span>,
    },
    {
      title: <span className="font-hanken font-weight-h">Name</span>,
      dataIndex: 'org_name',
      key: 'org_name',
      render: (text: string) => <span className="font-hanken">{text}</span>,
    },
    {
      title: <span className="font-hanken font-weight-h">Action</span>,
      key: 'action',
      render: (text: string, record: any) => (
        <div className="flex">
          <Button
            type="text"
            className="font-hanken border-none w-[80px] shadow-none text-[#AE00FF] hover:!text-[#AE00FF]"
            size="small"
            onClick={() => handleCreditsClick(record)}
          >
            Add credits
          </Button>
          <Button
            type="text"
            className="font-hanken ml-2 border-none shadow-none text-[#AE00FF] hover:!text-[#AE00FF]"
            size="small"
            onClick={() => handleParallelExecutionsClick(record)}
          >
            Parallel executions
          </Button>
          <Button
            type="text"
            className="font-hanken ml-2 border-none shadow-none text-[#AE00FF] hover:!text-[#AE00FF]"
            size="small"
            onClick={() => handleEditClick(record)}
          >
            Edit org
          </Button>
        </div>
      ),
    },
  ];

  const data = orgs?.organizations?.map((org: any) => ({
    key: org.org_id,
    ...org,
  })) || [];

  return (
    <>
      <Header />
      <MaxWidthWrapper className="py-4 px-3.5 md:px-20">
        <div className="w-full p-4 bg-white rounded-md">
          <span className="font-hanken font-weight-h text-h-3 text-[#4542CC] mb-4 block">
            Organizations
          </span>
          {getOrgsLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spin/>
            </div>
          ) : (
            <Table 
              columns={columns} 
              dataSource={data} 
              rowKey={(record, index) => record?.org_id ?? record?.key ?? `org-${index}`}
              pagination={false}
              size="small"
              className="font-hanken"
            />
          )}
        </div>

        {/* Add Credits Modal */}
        <Modal
          open={creditsOpen}
          onCancel={handleClose}
          title={
            <div className="flex justify-between items-center">
              <span className="font-hanken font-weight-h">Add credits</span>
            
            </div>
          }
          footer={[
            <Button key="cancel" onClick={handleClose}>
              Cancel
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              className="bg-[#AE00FF] hover:!bg-[#AE00FF] hover:!text-white hover:!border-[#AE00FF] border-[#AE00FF] font-hanken"
              disabled={
                creditsLoading || 
                loading ||
                (Number(aiCreditsToAdd) === (currentCredits?.ai_credits || 0) && 
                 Number(browserMinutesToAdd) === (currentCredits?.browser_minutes || 0))
              }
              loading={loading}
              onClick={() =>
                handleAddCredits({
                  ai_credits: Number(aiCreditsToAdd) || 0,
                  browser_minutes: Number(browserMinutesToAdd) || 0,
                })
              }
            >
              Add
            </Button>
          ]}
          width={500}
        >
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col gap-3">
                <span className="font-hanken font-weight-h text-[#666666]">Organization ID:</span>
                <span className="font-hanken font-weight-h text-[#666666]">Organization Name:</span>
                <span className="font-hanken font-weight-h text-[#666666]">AI Credits:</span>
                <span className="font-hanken font-weight-h text-[#666666]">Browser Minutes:</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-hanken text-[#333333]">{clickedOrg?.org_id}</span>
                <span className="font-hanken text-[#333333]">{clickedOrg?.org_name}</span>
                <span className="font-hanken text-[#333333]">
                  {creditsLoading ? "Loading..." : (currentCredits?.ai_credits || 0)}
                </span>
                <span className="font-hanken text-[#333333]">
                  {creditsLoading ? "Loading..." : (currentCredits?.browser_minutes || 0)}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-hanken text-sm text-[#666666] mb-2 block">AI Credits</label>
                <Input
                 type="number"
                 placeholder="Enter AI credits"
                 value={aiCreditsToAdd}
                 onChange={(e) => setAiCreditsToAdd(e.target.value)}
                 disabled={creditsLoading}
                 className="font-hanken [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
               />
              </div>
              <div>
                <label className="font-hanken text-sm text-[#666666] mb-2 block">Browser Minutes</label>
                <Input
                 type="number"
                 placeholder="Enter browser minutes"
                 value={browserMinutesToAdd}
                 onChange={(e) => setBrowserMinutesToAdd(e.target.value)}
                 disabled={creditsLoading}
                 className="font-hanken [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
               />
              </div>
            </div>
          </div>
        </Modal>

        {/* Parallel Executions Modal */}
        <Modal
          open={parallelExecutionsOpen}
          onCancel={handleClose}
          title={
            <div className="flex justify-between items-center">
              <span className="font-hanken font-weight-h">Update Parallel Executions</span>
            </div>
          }
          footer={[
            <Button key="cancel" onClick={handleClose}>
              Cancel
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              className="bg-[#AE00FF] hover:!bg-[#AE00FF] hover:!text-white hover:!border-[#AE00FF] border-[#AE00FF] font-hanken"
              disabled={
                parallelExecutionsLoading || 
                loading ||
                Number(newParallelExecutions) === (currentParallelExecutions?.rate_limit || 0)
              }
              loading={loading}
              onClick={() =>
                handleUpdateParallelExecutions({
                  rate_limit: Number(newParallelExecutions) || 0,
                })
              }
            >
              Update
            </Button>
          ]}
          width={500}
        >
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col gap-3">
                <span className="font-hanken font-weight-h text-[#666666]">Organization ID:</span>
                <span className="font-hanken font-weight-h text-[#666666]">Organization Name:</span>
                <span className="font-hanken font-weight-h text-[#666666]">Parallel Executions:</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-hanken text-[#333333]">{clickedOrg?.org_id}</span>
                <span className="font-hanken text-[#333333]">{clickedOrg?.org_name}</span>
                <span className="font-hanken text-[#333333]">
                  {parallelExecutionsLoading ? "Loading..." : (currentParallelExecutions?.rate_limit || 0)}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-hanken text-sm text-[#666666] mb-2 block">Update Parallel Executions</label>
                <Input
                 type="number"
                 placeholder="Enter new parallel executions"
                 value={newParallelExecutions}
                 onChange={(e) => setNewParallelExecutions(parseInt(e.target.value))}
                 disabled={parallelExecutionsLoading}
                 className="font-hanken [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
               />
              </div>
            </div>
          </div>
        </Modal>

        {/* Edit Organization Modal */}
        <Modal
          open={editOpen}
          onCancel={handleClose}
          title={
            <div className="flex justify-between items-center">
              <span className="font-hanken font-weight-h">Edit organization details</span>
              
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
              loading={loading}
              onClick={() =>
                handleSaveEdit(clickedOrg?.org_id, {
                  org_name: clickedOrg?.org_name,
                  org_email: clickedOrg?.org_email,
                  org_phone: clickedOrg?.org_phone,
                  org_domain: clickedOrg?.org_domain,
                  org_id: clickedOrg?.org_id,
                  org_status: clickedOrg?.org_status,
                  org_verified: clickedOrg?.org_verified
                })
              }
            >
              Save
            </Button>
          ]}
          width={600}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-hanken text-sm text-[#666666] mb-2 block">ID</label>
                <Input
                  value={clickedOrg?.org_id}
                  disabled
                  className="font-hanken"
                />
              </div>
              <div>
                <label className="font-hanken text-sm text-[#666666] mb-2 block">Name</label>
                <Input
                  value={clickedOrg?.org_name}
                  onChange={(e) =>
                    setClickedOrg((prev: any) => ({
                      ...prev,
                      org_name: e.target.value,
                    }))
                  }
                  className="font-hanken"
                />
              </div>
            
            
              <div>
                <label className="font-hanken text-sm text-[#666666] mb-2 block">Domain</label>
                <Input
                  value={clickedOrg?.org_domain}
                  onChange={(e) =>
                    setClickedOrg((prev: any) => ({
                      ...prev,
                      org_domain: e.target.value,
                    }))
                  }
                  className="font-hanken"
                />
              </div>
              <div>
                <label className="font-hanken text-sm text-[#666666] mb-2 block">Email</label>
                <Input
                  value={clickedOrg?.org_email}
                  onChange={(e) =>
                    setClickedOrg((prev: any) => ({
                      ...prev,
                      org_email: e.target.value,
                    }))
                  }
                  className="font-hanken"
                />
              </div>
              <div>
                <label className="font-hanken text-sm text-[#666666] mb-2 block">Phone</label>
                <Input
                  value={clickedOrg?.org_phone}
                  onChange={(e) =>
                    setClickedOrg((prev: any) => ({
                      ...prev,
                      org_phone: e.target.value,
                    }))
                  }
                  className="font-hanken"
                />
              </div>
              <div>
                <label className="font-hanken text-sm text-[#666666] mb-2 block">Status</label>
                <Select
                  value={clickedOrg?.org_status}
                  disabled
                  className="w-full font-hanken"
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </div>
              <div>
                <label className="font-hanken text-sm text-[#666666] mb-2 block">Verified</label>
                <Select
                  value={clickedOrg?.org_verified}
                  disabled
                  className="w-full font-hanken"
                >
                  <Option value="true">Yes</Option>
                  <Option value="false">No</Option>
                </Select>
              </div>
            </div>
          </div>
        </Modal>
      </MaxWidthWrapper>
    </>
  );
}
