"use client";
import Header from "@/components/AgentHeader/Header";
import { fetchOrgAPI, getOrgUsersAPI, deleteInviteAPI } from "@/lib/apis/documentAI/org";
import SendInviteModal from "@/components/SendInviteModal/SendInviteModal";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { toast } from "react-toastify";
import ApiKeysTable from "@/components/APIKeysTable/APIKeysTable";
import MaxWidthWrapper from "@/components/MaxWidthWrapper/MaxWidthWrapper";
import { getKeysAPI } from "@/lib/apis/documentAI/apiKey";
import { Spin } from "antd";
import CreateKey from "@/components/APIKeysTable/CreateKey";
import { Input, Button as AntdButton, message, Table } from "antd";
import DeleteConfirmation from "@/components/DeleteConfirmation/DeleteConfirmation";
import { set } from "zod";
import { useRouter } from "next/navigation";
import { getAllWebhooksAPI, updateWebhookAPI, createWebhookAPI } from "@/lib/apis/testAI/test";
import { RoleBasedButton } from "@/components/ui/role-based-button";
import { getCurrentActiveUserAPI } from "@/lib/apis/documentAI/user";
import { getOrgSubscriptionAPI, getCustomerPortalAPI, getPlansAPI } from "@/lib/apis/billing/billing";
export default function Page() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    document.title = "Settings - Litmus Check";
  }, []);
  const { currentUserDetails, userLoading } = useUser();
  const [localUserDetails, setLocalUserDetails] = useState<any>(null);
  const [loadingLocalUser, setLoadingLocalUser] = useState(false);
  const router = useRouter();
  const [getApiKeysLoading, setGetApiKeysLoading] = useState(true);
  const [getOrgLoading, setGetOrgLoading] = useState(true);
  const [orgDetails, setOrgDetails] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState([])
  const [webhookObject, setWebhookObject] = useState<any>(null);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookURL, setWebhookURL] = useState('');
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [orgUsers, setOrgUsers] = useState<any[]>([]);
  const [orgUsersLoading, setOrgUsersLoading] = useState(false);
  const [deleteInviteLoading, setDeleteInviteLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteInviteModal, setShowDeleteInviteModal] = useState(false);
  const [inviteToDelete, setInviteToDelete] = useState<string | null>(null);
  
  // Fetch user details if not available from context
  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      if (currentUserDetails) {
        setLocalUserDetails(currentUserDetails);
        return;
      }
      if (!isLoaded || !isSignedIn) return;
      
      try {
        setLoadingLocalUser(true);
        const token = await getToken({ template: "basic" });
        if (!token) {
          setLocalUserDetails(null);
          return;
        }
        const res = await getCurrentActiveUserAPI(token);
        if (!isMounted) return;
        if (res?.status === 200) {
          setLocalUserDetails(res.data);
        } else {
          setLocalUserDetails(null);
        }
      } catch (e) {
        if (!isMounted) return;
        setLocalUserDetails(null);
      } finally {
        if (isMounted) setLoadingLocalUser(false);
      }
    };
    fetchUser();
    return () => { isMounted = false; };
  }, [currentUserDetails]);

  const finalUserDetails = localUserDetails || currentUserDetails;

  async function getApiKeys(){
    const token = await getToken({ template: "basic" });
    if(token===null){
      router.push("/sign-in");
      setGetApiKeysLoading(false);
      return;
    }
    if(finalUserDetails?.role === 'viewer'){
      setGetApiKeysLoading(false);
      return;
    }
    try{
      const response = await getKeysAPI(token)

      if (response.status === 200) {
        setApiKeys(response.data.apikeys);
        setGetApiKeysLoading(false);
      } else {
        setGetApiKeysLoading(false);
        toast.error("There was an error");
      }
    }catch (error: any) {
      setGetApiKeysLoading(false);
      toast.error(error);
    }
  }

  const getAllWebhooks = async ()=>{
    const token = await getToken({ template: "basic" });
    if(token===null){
      router.push("/sign-in");
      return;
    }
    try{
      const response = await getAllWebhooksAPI(token)
      if(response.status===200){
        setWebhookObject(response.data.webhooks[response.data.webhooks.length-1])
      }
    }catch (error: any) {
      message.error(error);
    }
    
  }
  useEffect(()=>{
    if( finalUserDetails && finalUserDetails?.role !== 'viewer'){
      getApiKeys()    
      getAllWebhooks()
    } else if (finalUserDetails && finalUserDetails?.role === 'viewer') {
      // For viewers, we don't need to load API keys, so set loading to false
      setGetApiKeysLoading(false);
    }
  }, [finalUserDetails])


  useEffect(()=>{
    if(webhookObject){
      setWebhookURL(webhookObject.webhook_url)
    }
    console.log(webhookObject)
  }, [webhookObject])


  const updateWebhook = async ()=>{
    setWebhookLoading(true)
    const token = await getToken({ template: "basic" });
    if(token===null){
      router.push("/sign-in");
    }
    try{
      const response = await updateWebhookAPI(token, webhookObject.id, webhookObject.webhook_url)
      if(response.status===200){
        message.success("Webhook updated successfully");
        setWebhookLoading(false)
      }
    }catch (error: any) {
      message.error(error);
      setWebhookLoading(false)
    }
  }
  const createWebhook = async ()=>{
    setWebhookLoading(true)
    const token = await getToken({ template: "basic" });
    if(token===null){
      router.push("/sign-in");
    }
    try{
      const response = await createWebhookAPI(token, webhookURL)
      if(response.status===200){
        message.success("Webhook created successfully");
        setWebhookLoading(false)
      }
    }catch (error: any) {
      message.error(error);
      setWebhookLoading(false)
    }

  }

  const handleApiKeyDelete = (deletedKeyId: string) => {
    setApiKeys(prevKeys => prevKeys.filter((key: any) => key.apikey_id !== deletedKeyId));
  }

  const getInviteEmail = (invitationId: string | null): string => {
    if (!invitationId) return '';
    const user = orgUsers.find(user => user.invitation_id === invitationId);
    return user?.email || 'this email';
  };

  const handleDeleteInvite = async (invitationId: string) => {
    setDeleteInviteLoading(true);
    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
      setDeleteInviteLoading(false);
      return;
    }
    
    const orgId = finalUserDetails?.org_id;
    if (!orgId) {
      message.error("Organization ID not found");
      setDeleteInviteLoading(false);
      return;
    }
    
    try {
      const response = await deleteInviteAPI(token, orgId, invitationId);
      if (response.status === 200) {
        message.success("Invitation deleted successfully");
        // Remove the deleted invitation from the list
        setOrgUsers(prevUsers => prevUsers.filter(user => user.invitation_id !== invitationId));
        setShowDeleteInviteModal(false);
        setInviteToDelete(null);
      } else {
        message.error("Failed to delete invitation");
      }
    } catch (error: any) {
      message.error(error.message || "Failed to delete invitation");
    } finally {
      setDeleteInviteLoading(false);
    }
  };

  const handleInviteSuccess = async () => {
    // Refresh the users list after successful invite
    const token = await getToken({ template: "basic" });
    if (token === null) {
      return;
    }
    const orgId = finalUserDetails?.org_id;
    if (!orgId) {
      return;
    }
    const usersResponse = await getOrgUsersAPI(token, orgId);
    if (usersResponse.status === 200) {
      const membersList = (usersResponse.data.users || usersResponse.data.org_members || []).map((member: any) => ({
        email: member.email,
        role: member.role,
        status: "joined",
        user_id: member.user_id,
        created_at: member.created_date || member.created_at,
      }));
      
      const pendingList = (usersResponse.data.open_invitations || usersResponse.data.pending_invitations || []).map((invitation: any) => ({
        email: invitation.invitee_email || invitation.email,
        role: invitation.invitee_role || invitation.role,
        status: "invited",
        invitation_id: invitation.invitation_id || invitation.invite_id,
        created_at: invitation.created_date || invitation.created_at,
      }));
      
      setOrgUsers([...membersList, ...pendingList]);
    }
  };

  useEffect(() => {
    async function getOrg() {
      const token = await getToken({ template: "basic" });
      if(token===null){
        router.push("/sign-in");
        setGetOrgLoading(false);
        return;
      }
      try {
        const orgId = finalUserDetails?.org_id;
        const response = await fetchOrgAPI(token, orgId);

        if (response.status === 200) {
          setOrgDetails(response.data);
          setGetOrgLoading(false);
        } else {
          setGetOrgLoading(false);
          toast.error("There was an error");
        }
      } catch (error: any) {
        setGetOrgLoading(false);
        toast.error(error);
      }
    }

    if (finalUserDetails) {
      getOrg();
    } else {
      setGetOrgLoading(false);
    }
  }, [finalUserDetails]);

  useEffect(() => {
    async function getOrgUsers() {
      const token = await getToken({ template: "basic" });
      if(token===null){
        router.push("/sign-in");
        setOrgUsersLoading(false);
        return;
      }
      try {
        const orgId = finalUserDetails?.org_id;
        if (!orgId) {
          setOrgUsersLoading(false);
          return;
        }
        setOrgUsersLoading(true);
        const response = await getOrgUsersAPI(token, orgId);

        if (response.status === 200) {
          // Combine users and open_invitations into a single list
          // Status is determined by which array the user is in:
          // - users = "joined" (user has accepted invitation)
          // - open_invitations = "invited" (user has been invited but not joined yet)
          // Support both new format (users/open_invitations) and old format (org_members/pending_invitations)
          const membersList = (response.data.users || response.data.org_members || []).map((member: any) => ({
            email: member.email,
            role: member.role,
            status: "joined", // Users in users/org_members have joined
            user_id: member.user_id,
            created_at: member.created_date || member.created_at,
          }));
          
          const pendingList = (response.data.open_invitations || response.data.pending_invitations || []).map((invitation: any) => ({
            email: invitation.invitee_email || invitation.email,
            role: invitation.invitee_role || invitation.role,
            status: "invited", // Users in open_invitations/pending_invitations are invited but not joined
            invitation_id: invitation.invitation_id || invitation.invite_id,
            created_at: invitation.created_date || invitation.created_at,
          }));
          
          setOrgUsers([...membersList, ...pendingList]);
          setOrgUsersLoading(false);
        } else {
          setOrgUsersLoading(false);
          toast.error("There was an error fetching users");
        }
      } catch (error: any) {
        setOrgUsersLoading(false);
        toast.error(error);
      }
    }

    if (finalUserDetails?.org_id) {
      getOrgUsers();
    } else {
      setOrgUsersLoading(false);
    }
  }, [finalUserDetails?.org_id]);

  useEffect(() => {
    async function fetchSubscriptionsAndPlans() {
      if (!finalUserDetails?.org_id) return;
      
      const token = await getToken({ template: "basic" });
      if (!token) return;

      try {
        setSubscriptionsLoading(true);
        
        // Fetch subscriptions and plans in parallel
        const [subscriptionsRes, plansRes] = await Promise.all([
          getOrgSubscriptionAPI(token, finalUserDetails.org_id),
          getPlansAPI(token)
        ]);

        if (subscriptionsRes?.status === 200) {
          const subs = Array.isArray(subscriptionsRes?.data?.subscriptions) 
            ? subscriptionsRes.data.subscriptions 
            : [];
          setSubscriptions(subs);
        }

        if (plansRes?.status === 200) {
          const plansList = Array.isArray(plansRes?.data?.plans) 
            ? plansRes.data.plans 
            : [];
          setPlans(plansList);
        }
      } catch (error: any) {
        message.error(error?.message || "Failed to load subscriptions");
      } finally {
        setSubscriptionsLoading(false);
      }
    }

    if (finalUserDetails?.org_id) {
      fetchSubscriptionsAndPlans();
    }
  }, [finalUserDetails?.org_id, getToken]);

  const handleManageSubscription = async (subscriptionId: string) => {
    try {
      const token = await getToken({ template: "basic" });
      if (!token) return;

      const res = await getCustomerPortalAPI(token, subscriptionId);
      if (res?.status === 200 && res?.data?.customer_url) {
        window.open(res.data.customer_url, "_blank");
      } else {
        message.error("Failed to get customer portal URL");
      }
    } catch (error: any) {
      message.error(error?.message || "Failed to open customer portal");
    }
  };

  const getPlanName = (planId: string) => {
    const plan = plans.find(p => p.plan_id === planId);
    return plan?.plan_name || "Unknown Plan";
  };
  return ( getApiKeysLoading || userLoading || loadingLocalUser || getOrgLoading || (!finalUserDetails && isLoaded && isSignedIn)) ?( <div className="flex justify-center align-center items-center h-screen">
    <Spin />
</div>): (
    <>
    <Header/>
    <MaxWidthWrapper className="py-4 px-3.5 md:px-20">
      <div className="w-full p-4 bg-white rounded-md mb-5" data-testid="settings-org-section">
        <span className="font-hanken font-weight-h text-h-3 text-[#4542CC]" data-testid="settings-org-title">Organization Details</span>
        <div className="flex gap-5 mt-5" data-testid="settings-org-details">
          <div className="flex flex-col font-hanken font-weight-h gap-3 text-[#666666]">
            <div>Organization ID</div>
          </div>
          <div className="flex flex-col font-hanken gap-3 text-[#333333]">
         
          <div data-testid="settings-org-id">
          {orgDetails?.org_id ?? 'NA'}
          </div>
          
          
          </div>
          
        </div>
      </div>
      <div className="w-full p-4 bg-white rounded-md mb-5" data-testid="settings-org-users-section">
        <div className="flex justify-between items-center mb-4">
          <span className="font-hanken font-weight-h text-h-3 text-[#4542CC]" data-testid="settings-org-users-title">Organization Users</span>
          {finalUserDetails?.role !== 'viewer' && (
            <RoleBasedButton
              type="primary"
              className="!bg-[#4542CC] hover:!bg-[#4542CC] hover:!text-white !text-white !border-[#4542CC] font-hanken"
              onClick={() => setShowInviteModal(true)}
              data-testid="settings-send-invite-button"
            >
              Send Invite
            </RoleBasedButton>
          )}
        </div>
        {orgUsersLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spin />
          </div>
        ) : orgUsers.length === 0 ? (
          <div className="font-hanken text-[#666666]" data-testid="settings-org-users-empty">
            No users found
          </div>
        ) : (
          <>
            <Table 
          columns={[
            {
              title: <span className='font-hanken font-weight-h'>Email</span>,
              dataIndex: 'email',
              key: 'email',
              render: (text: string) => <span className='font-hanken'>{text}</span>,
            },
            {
              title: <span className='font-hanken font-weight-h'>Role</span>,
              dataIndex: 'role',
              key: 'role',
              render: (text: string) => <span className='font-hanken'>{text}</span>,
            },
            {
              title: <span className='font-hanken font-weight-h'>Status</span>,
              dataIndex: 'status',
              key: 'status',
              render: (text: string) => (
                <span className={`font-hanken ${text === 'joined' ? 'text-green-600' : 'text-orange-600'}`}>
                  {text}
                </span>
              ),
            },
            {
              title: <span className='font-hanken font-weight-h'>Action</span>,
              key: 'actions',
              render: (text: string, record: any) => {
                // Only show delete button for invitations (status === "invited")
                if (record.status === "invited") {
                  return (
                    <AntdButton
                      type="text"
                      className="font-hanken border-none shadow-none text-[#EA3962] hover:!text-[#EA3962]"
                      size="small"
                      onClick={() => {
                        setInviteToDelete(record.invitation_id);
                        setShowDeleteInviteModal(true);
                      }}
                      data-testid="delete-invite-button"
                    >
                      Delete Invite
                    </AntdButton>
                  );
                }
                return null;
              },
            },
          ]}
          dataSource={orgUsers}
          rowKey={(record) => record.user_id || record.invitation_id}
          pagination={false}
          size="small"
          style={{ width: '100%' }}
          data-testid="settings-org-users-table"
        />
            <div className="font-hanken text-[#666666] mt-4 text-sm" data-testid="settings-org-users-note">
              If you want to update user role or delete an existing user, kindly reach out to <span className="text-[#4542CC]">contact@litmuscheck.com</span>
            </div>
          </>
        )}
      </div>
      <div className="w-full p-4 bg-white rounded-md mb-5" data-testid="settings-webhook-section">
        <h2 className="font-hanken font-weight-h text-h-3 text-[#4542CC] mb-2" data-testid="settings-webhook-title">Slack Webhook</h2>
        <p className="font-hanken text-[#666666] mb-4" data-testid="settings-webhook-description">Configure a webhook to receive test related notifications on your slack channel</p>
        <div className="flex gap-3 items-center" data-testid="settings-webhook-form">
          <Input.Password 
            className="flex-1" 
            placeholder="Enter your slack webhook url" 
            value={webhookURL} 
            onChange={(e)=>{
              setWebhookURL(e.target.value)
            }}
            data-testid="settings-webhook-input"
          />
          <RoleBasedButton 
            loading={webhookLoading} 
            className="!bg-[#AE00FF] hover:!bg-[#AE00FF] hover:!text-white !text-white !border-[#AE00FF] font-hanken" 
            onClick={()=>{
              if(webhookObject){
                updateWebhook()
              }else{
                createWebhook()
              }
            }}
            data-testid="settings-webhook-save-button"
          >
            Save
          </RoleBasedButton>
        </div>
      </div>
      <div>

      </div>
      <div className="w-full p-4 bg-white rounded-md" data-testid="settings-api-keys-section">
        <div className="flex justify-between items-center mb-4">
          <span className="font-hanken font-weight-h text-h-3 text-[#4542CC]" data-testid="settings-api-keys-title">API Key Details</span>
          <CreateKey onKeyCreated={getApiKeys} data-testid="settings-create-key-button"/>
        </div>
        {apiKeys.length==0 && finalUserDetails?.role !== 'viewer' && <div className="font-hanken text-[#666666] mb-4" data-testid="settings-api-keys-empty">
          You do not have any API keys.
        </div>}
        <div className="mt-5" data-testid="settings-api-keys-table">
          <ApiKeysTable apiKeys={apiKeys} onDelete={handleApiKeyDelete}/>
        </div>
      </div>
      <div className="w-full p-4 bg-white rounded-md mt-5" data-testid="settings-subscriptions-section">
        <span className="font-hanken font-weight-h text-h-3 text-[#4542CC]" data-testid="settings-subscriptions-title">Subscriptions</span>
        {subscriptionsLoading ? (
          <div className="flex justify-center items-center py-10">
            <Spin />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="font-hanken text-[#666666] mt-4" data-testid="settings-subscriptions-empty">
            No active subscriptions.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {subscriptions.map((subscription) => (
              <div key={subscription.subscription_id} className="border border-gray-200 rounded-md p-4" data-testid={`settings-subscription-${subscription.subscription_id}`}>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-2">
                    <div className="font-hanken font-medium text-gray-800">
                      {getPlanName(subscription.plan_id)}
                    </div>
                    <div className="font-hanken text-sm text-gray-600">
                      Status: <span className={`font-medium ${subscription.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>{subscription.status || 'N/A'}</span>
                    </div>
                    {subscription.next_payment_date && (
                      <div className="font-hanken text-xs text-gray-500">
                        Next payment: {new Date(subscription.next_payment_date).toLocaleDateString()}
                      </div>
                    )}
                    {subscription.renews_at && (
                      <div className="font-hanken text-xs text-gray-500">
                        Renews at: {new Date(subscription.renews_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <RoleBasedButton
                    className="!bg-[#4542CC] hover:!bg-[#4542CC] hover:!text-white !text-white !border-[#4542CC] font-hanken"
                    onClick={() => handleManageSubscription(subscription.subscription_id)}
                    data-testid={`settings-manage-subscription-${subscription.subscription_id}`}
                  >
                    Manage Subscription
                  </RoleBasedButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </MaxWidthWrapper>
      
      {/* Send Invite Modal */}
      <SendInviteModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={handleInviteSuccess}
        orgId={finalUserDetails?.org_id || ""}
        resourceType={null}
        resourceId={null}
        resourceUrl={null}
        getToken={async () => {
          const token = await getToken({ template: "basic" });
          if (token === null) {
            router.push("/sign-in");
          }
          return token;
        }}
        title="Send Invite"
      />
      
      {/* Delete Invite Modal */}
      <DeleteConfirmation
        id={inviteToDelete || ""}
        open={showDeleteInviteModal}
        titleText="Delete Invitation"
        confirmationText={`Are you sure you want to delete the invitation sent to ${getInviteEmail(inviteToDelete)}?`}
        handleDelete={handleDeleteInvite}
        handleCancel={() => {
          setShowDeleteInviteModal(false);
          setInviteToDelete(null);
        }}
        loading={deleteInviteLoading}
        buttonText="Delete Invite"
      />
      </>
  );
}
