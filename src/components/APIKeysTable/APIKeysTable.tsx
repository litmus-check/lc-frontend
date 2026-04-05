import React, { useState } from 'react';
import { Table, Button, Space, message, Popconfirm, Spin } from 'antd';

import { deleteKeyAPI } from '@/lib/apis/documentAI/apiKey';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
const ApiKeysTable = ({ apiKeys, onDelete }: any) => {
    const [visibleKeys, setVisibleKeys] = useState<{ [key: string]: boolean }>({});
    const [deleteLoading, setDeleteLoading] = useState<{ [key: string]: boolean }>({});
    const { getToken } = useAuth();
    const router = useRouter();
    const { currentUserDetails, userLoading } = useUser();
    const userRole = currentUserDetails?.role;
    const isLoading = userLoading;
    const handleVisibilityToggle = (id: string) => {
        setVisibleKeys(prevState => ({ ...prevState, [id]: !prevState[id] }));
    };

    const handleDelete = async (apikeyId: string, apikeyKey: string) => {
        setDeleteLoading(prev => ({ ...prev, [apikeyId]: true }));
        const token = await getToken({ template: "basic" });
        if (token === null) {
            router.push("/sign-in");
            return;
        }
        
        try {
            const response = await deleteKeyAPI(token, apikeyKey);
            if (response.status === 200) {
                message.success("API key deleted successfully");
                if (onDelete) {
                    onDelete(apikeyId);
                }
            } else {
                message.error("Failed to delete API key");
            }
        } catch (error: any) {
            message.error(error.message || "Failed to delete API key");
        } finally {
            setDeleteLoading(prev => ({ ...prev, [apikeyId]: false }));
        }
    };

    const columns = [
        {
            title: <span className='font-hanken font-weight-h'>Key Name</span>,
            dataIndex: 'apikey_name',
            key: 'apikey_name',
            render: (text: string) => <span className='font-hanken'>{text}</span>,
        },
        {
            title: <span className='font-hanken font-weight-h'>Expiry Date</span>,
            dataIndex: 'apikey_expiry',
            key: 'apikey_expiry',
            render: (text: string) => <span className='font-hanken'>{text}</span>,
        },
        {
            title: <span className='font-hanken font-weight-h'>Key Value</span>,
            dataIndex: 'apikey_key',
            key: 'apikey_key',
            render: (text: string, record: any) => (
                <span className="font-hanken">
                    {visibleKeys[record.apikey_id]
                        ? text
                        : text.split('').map((_: any, i: any) => (
                            <span key={i} style={{ fontSize: '8px' }}>●</span>
                          ))}
                </span>
            ),
        },
        {
            title: <span className='font-hanken font-weight-h'>Action</span>,
            key: 'actions',
            render: (text: string, record: any) => (
                <div className="flex">
                    <Button
                        type="text"
                        size="small"
                        className="font-hanken border-none w-[50px] shadow-none text-[#AE00FF] hover:!text-[#AE00FF]"
                        onClick={() => handleVisibilityToggle(record.apikey_id)}
                    >
                        {visibleKeys[record.apikey_id] ? 'Hide' : 'View'}
                    </Button>
                    <Popconfirm
                        title="Delete API Key"
                        description="Are you sure you want to delete this API key? This action cannot be undone."
                        onConfirm={() => handleDelete(record.apikey_id, record.apikey_key)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="text"
                            className="font-hanken ml-5 border-none shadow-none text-[#EA3962] hover:!text-[#EA3962]"
                            loading={deleteLoading[record.apikey_id]}
                            size="small"
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        isLoading ? (
            <div className="flex justify-center items-center py-8">
                <Spin />
            </div>
        ) : userRole !== 'viewer' ? (
            <Table 
                columns={columns} 
                dataSource={apiKeys} 
                rowKey="apikey_id"
                pagination={false}
                size="small"
                style={{ width: '100%' }}
            />
        ) : (
            <div className="font-hanken text-[#666666]">No permission to view this data</div>
        )
    );
};

export default ApiKeysTable;
