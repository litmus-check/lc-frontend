"use client";
import { useState, useEffect } from "react";
import { Modal, Input, Select, Button, message } from "antd";
import { inviteUserToOrgAPI } from "@/lib/apis/documentAI/org";

interface SendInviteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  orgId: string;
  resourceType?: string | null;
  resourceId?: string | null;
  resourceUrl?: string | null;
  getToken: () => Promise<string | null>;
  title?: string;
}

export default function SendInviteModal({
  open,
  onClose,
  onSuccess,
  orgId,
  resourceType = null,
  resourceId = null,
  resourceUrl = null,
  getToken,
  title = "Send Invite"
}: SendInviteModalProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setInviteEmail("");
      setInviteRole("");
    }
  }, [open]);

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteRole) {
      message.error("Please fill in both email and role");
      return;
    }

    const token = await getToken();
    if (token === null) {
      message.error("Authentication required");
      return;
    }

    if (!orgId) {
      message.error("Organization ID not found");
      return;
    }

    setInviteLoading(true);
    try {
      const response = await inviteUserToOrgAPI(token, orgId, {
        invitee_email: inviteEmail,
        resource_type: resourceType ?? null,
        resource_id: resourceId ?? null,
        resource_url: resourceUrl ?? null,
        invitee_role: inviteRole,
      });

      if (response.status === 200) {
        message.success("User invited successfully");
        onClose();
        setInviteEmail("");
        setInviteRole("");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error("Failed to send invitation");
      }
    } catch (error: any) {
      message.error(error.message || "Failed to send invitation");
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={[
        <Button
          key="cancel"
          onClick={onClose}
          className="font-hanken"
        >
          Cancel
        </Button>,
        <Button
          key="send"
          type="primary"
          onClick={handleSendInvite}
          loading={inviteLoading}
          className="font-hanken !bg-[#4542CC] hover:!bg-[#4542CC] hover:!text-white !text-white !border-[#4542CC]"
          disabled={inviteLoading}
        >
          Send Invite
        </Button>,
      ]}
      width={500}
      data-testid="send-invite-modal"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }} className="font-hanken">
            Email <span style={{ color: '#ff4d4f' }}>*</span>
          </label>
          <Input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email address"
            className="font-hanken"
            data-testid="invite-email-input"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }} className="font-hanken">
            Role <span style={{ color: '#ff4d4f' }}>*</span>
          </label>
          <Select
            value={inviteRole}
            onChange={(value) => setInviteRole(value)}
            placeholder="Select role"
            className="font-hanken w-full"
            data-testid="invite-role-select"
          >
            <Select.Option value="user">User</Select.Option>
            <Select.Option value="viewer">Viewer</Select.Option>
          </Select>
        </div>
      </div>
    </Modal>
  );
}

