"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { message, Table, Tabs, Tooltip, Button, Tag } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import { getTestRunsForSuiteRunAPI, getTestSuiteAPI, getHealingSuggestionsAPI } from "@/lib/apis/testAI/test";
import LogsComponent from "@/components/LogsComponent/LogsComponent";
import Link from "next/link";
import Image from "next/image";
import SendInviteModal from "../SendInviteModal/SendInviteModal";
import { useUser } from "@/contexts/UserContext";
import { RoleBasedButton } from "../ui/role-based-button";

interface SuiteRunLogsProps {
  suiteId: string;
  suiteRunId: string;
  showHeader?: boolean;
}

export default function SuiteRunLogs({ 
  suiteId, 
  suiteRunId, 
  showHeader = true 
}: SuiteRunLogsProps) {
  const { getToken } = useAuth();
  const router = useRouter();
  const { currentUserDetails } = useUser();
  const [messageApi, contextHolder] = message.useMessage();
  const [suiteRunData, setSuiteRunData] = useState<any>(null);
  const [suiteData, setSuiteData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedRows, setExpandedRows] = useState<{[key: string]: boolean}>({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [healingSuggestionsData, setHealingSuggestionsData] = useState<any[]>([]);
  const [healingSuggestionsLoading, setHealingSuggestionsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("testruns");
  const [healingSuggestionsMap, setHealingSuggestionsMap] = useState<{[key: string]: any}>({});

  const errorsColumns = [
    {
      title: "Test Name",
      dataIndex: "testName",
      key: "testName",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-2">
          <p className="font-hanken text-[14px]">{text}</p>
          <Tooltip title="Go to test">
            <Link
              href={`/dashboard/suite/${suiteId}/test/${record.testId}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation(); // Prevent row from expanding
              }}
            >
              <ExportOutlined className="text-[#AE00FF] cursor-pointer hover:text-[#8e00cc] text-xs" aria-label="Go to test" />
            </Link>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Errors",
      dataIndex: "errors",
      key: "errors",
      render: (text: string) => (
        <p className="font-hanken text-[14px] text-red-600">{text}</p>
      ),
    },
  ];

  const triageColumns = [
    {
      title: "Test Name",
      dataIndex: "testName",
      key: "testName",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-2">
          <p className="font-hanken text-[14px]">{text}</p>
          <Tooltip title="Go to test">
            <Link
              href={`/dashboard/suite/${suiteId}/test/${record.testId}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation(); // Prevent row from expanding
              }}
            >
              <ExportOutlined className="text-[#AE00FF] cursor-pointer hover:text-[#8e00cc] text-xs" aria-label="Go to test" />
            </Link>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text: string, record: any) => (
        <div className="flex gap-2 flex-wrap">
          <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-medium ${
            text === 'update_script' ? 'bg-blue-100 text-blue-800' :
            text === 'environment_issue' ? 'bg-yellow-100 text-yellow-800' :
            text === 'application_issue' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {text?.replace(/_/g, ' ')}
          </span>
          {record?.subCategory && (
            <span className="inline-block px-2 py-1 rounded-full text-[12px] font-medium bg-blue-50 text-blue-700">
              {record?.subCategory?.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Data Index",
      dataIndex: "data_row_index",
      key: "data_row_index",
      render: (text: any) => (
        <p className="font-hanken text-[14px]">{text || ""}</p>
      ),
    },
    {
      title: "Reasoning",
      dataIndex: "reasoning",
      key: "reasoning",
      render: (text: string, record: any) => (
        <div className="max-w-md">
          {expandedRows[record?.key] ? (
            <div>
              <p className="font-hanken text-justify leading-relaxed">
                {text}
              </p>
              <button
                onClick={() => {
                  // Toggle expanded state for this row
                  const newExpandedRows = { ...expandedRows };
                  newExpandedRows[record?.key] = !newExpandedRows[record?.key];
                  setExpandedRows(newExpandedRows);
                }}
                className="text-[#AE00FF] hover:text-[#AE00FF] text-[12px] mt-1"
              >
                Show less
              </button>
            </div>
          ) : (
            <div>
              <p className="font-hanken line-clamp-2">
                {text?.length > 100 ? `${text?.substring(0, 100)}...` : text}
              </p>
              {text?.length > 100 && (
                <button
                  onClick={() => {
                    // Toggle expanded state for this row
                    const newExpandedRows = { ...expandedRows };
                    newExpandedRows[record?.key] = !newExpandedRows[record?.key];
                    setExpandedRows(newExpandedRows);
                  }}
                  className="text-[#AE00FF] hover:text-[#AE00FF] text-[12px] mt-1"
                >
                  Show more
                </button>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  const healingSuggestionsColumns = [
    {
      title: "Test Name",
      dataIndex: "testName",
      key: "testName",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-2">
          <p className="font-hanken text-[14px]">{text}</p>
          <Tooltip title="Go to test">
            <Link
              href={`/dashboard/suite/${suiteId}/test/${record.testId}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation(); // Prevent row from expanding
              }}
            >
              <ExportOutlined className="text-[#AE00FF] cursor-pointer hover:text-[#8e00cc] text-xs" aria-label="Go to test" />
            </Link>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text: string, record: any) => (
        <div className="flex gap-2 flex-wrap">
          <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-medium ${
            text === 'update_script' ? 'bg-blue-100 text-blue-800' :
            text === 'environment_issue' ? 'bg-yellow-100 text-yellow-800' :
            text === 'application_issue' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {text?.replace(/_/g, ' ')}
          </span>
          {record?.subCategory && (
            <span className="inline-block px-2 py-1 rounded-full text-[12px] font-medium bg-blue-50 text-blue-700">
              {record?.subCategory?.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Data Index",
      dataIndex: "data_row_index",
      key: "data_row_index",
      render: (text: any) => (
        <p className="font-hanken text-[14px]">{text || ""}</p>
      ),
    },
    {
      title: "Reasoning",
      dataIndex: "reasoning",
      key: "reasoning",
      render: (text: string, record: any) => (
        <div className="max-w-md">
          {expandedRows[record?.key] ? (
            <div>
              <p className="font-hanken text-justify leading-relaxed">
                {text}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click
                  // Toggle expanded state for this row
                  const newExpandedRows = { ...expandedRows };
                  newExpandedRows[record?.key] = !newExpandedRows[record?.key];
                  setExpandedRows(newExpandedRows);
                }}
                className="text-[#AE00FF] hover:text-[#AE00FF] text-[12px] mt-1"
              >
                Show less
              </button>
            </div>
          ) : (
            <div>
              <p className="font-hanken line-clamp-2">
                {text?.length > 100 ? `${text?.substring(0, 100)}...` : text}
              </p>
              {text?.length > 100 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    // Toggle expanded state for this row
                    const newExpandedRows = { ...expandedRows };
                    newExpandedRows[record?.key] = !newExpandedRows[record?.key];
                    setExpandedRows(newExpandedRows);
                  }}
                  className="text-[#AE00FF] hover:text-[#AE00FF] text-[12px] mt-1"
                >
                  Show more
                </button>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Healing Suggestion",
      key: "healingSuggestion",
      render: (text: string, record: any) => {
        const status = record.fullHealingSuggestion?.status?.toLowerCase();
        if (status === 'failed') {
          return (
            <p className="font-hanken text-[14px] text-red-600">
              healing failed
            </p>
          );
        }
        return (
          <Button
            type="text"
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              handleHealingSuggestionRowClick(record);
            }}
            className="font-hanken border-none shadow-none text-[#AE00FF] hover:!text-[#AE00FF]"
          >
            View Suggestion
          </Button>
        );
      },
    },
  ];

  // Transform errors object to table data
  const errorsData = suiteRunData?.errors ? Object.keys(suiteRunData.errors).map((testId: string) => {
    const errorInfo = suiteRunData?.errors[testId];
    return {
      key: testId,
      testId: testId,
      testName: errorInfo.test_name,
      errors: errorInfo.errors.join(', '),
    };
  }) : [];

  // Transform triage results to table data
  const triageData = suiteRunData?.triage_result ? suiteRunData.triage_result.map((triage: any, index: number) => ({
    key: `triage-${triage.test_id}-${index}`,
    testId: triage.test_id,
    testName: triage.test_name,
    category: triage.category,
    subCategory: triage.sub_category,
    data_row_index: triage.data_row_index,
    reasoning: triage.reasoning,
    rowNumber: triage.row_number,
  })) : [];

  // Transform healing suggestions to table data - extract triage_result from each healing suggestion
  const transformedHealingSuggestionsData = healingSuggestionsData
    .filter((heal: any) => heal.triage_result) // Only include items with triage_result
    .map((heal: any, index: number) => {
      const triage = heal.triage_result;
      return {
        key: `heal-${heal.id || triage.test_id}-${index}`,
        testId: triage.test_id,
        testName: triage.test_name,
        category: triage.category,
        subCategory: triage.sub_category,
        data_row_index: triage.data_row_index,
        reasoning: triage.reasoning,
        rowNumber: triage.row_number,
        healingSuggestionId: heal.id, // Keep the healing suggestion ID for future use
        fullHealingSuggestion: heal, // Store full healing suggestion data for navigation
      };
    });

  // Shared function to render triage table
  const renderTriageTable = (data: any[], loading: boolean = false, emptyMessage: string = "No data found", onRowClick?: (record: any) => void, columns?: any[]) => {
    if (loading) {
      return (
        <div className="text-center text-gray-500 py-8">
          Loading...
        </div>
      );
    }
    
    if (data.length === 0) {
      return (
        <div className="text-center text-gray-500">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div>
        <Table
          className="font-hanken rounded-none [&_.ant-table-thead>tr>th:first-child]:rounded-none [&_.ant-table-thead>tr>th:first-child]:[border-start-start-radius:0px]"
          size="small"
          columns={columns || triageColumns}
          dataSource={data}
          rowKey={(record, index) => record?.key ?? `row-${index}`}
          pagination={false}
          loading={loading}
          onRow={onRowClick ? (record) => ({
            onClick: () => onRowClick(record),
            style: { cursor: 'pointer' }
          }) : undefined}
        />
      </div>
    );
  };

  const handleHealingSuggestionRowClick = (record: any) => {
    if (record.fullHealingSuggestion) {
      // Navigate to healing suggestion detail page
      const healingSuggestionId = record.healingSuggestionId;
      window.open(`/dashboard/suite/${suiteId}/run/${suiteRunId}/healing-suggestion/${healingSuggestionId}`, '_blank');
    }
  };

  const getSuiteData = async () => {
    const token = await getToken({ template: "basic" });
    if (!token) {
      router.push("/sign-in");
      return;
    }
    
    try {
      const response = await getTestSuiteAPI(token, suiteId);
      if (response.status === 200) {
        setSuiteData(response.data);
      } else {
        messageApi.error("Failed to load suite data");
      }
    } catch (error: any) {
      messageApi.error("Failed to load suite data");
    }
  };

  const getSuiteRunData = async () => {
    const token = await getToken({ template: "basic" });
    if (!token) {
      router.push("/sign-in");
      return;
    }
    
    setLoading(true);
    try {
      const response = await getTestRunsForSuiteRunAPI(
        token,
        1, // page
        100, // limit - increased to match LogsComponent pagination
        suiteId,
        suiteRunId
      );
      if (response.status === 200) {
        setSuiteRunData(response.data);
      } else {
        messageApi.error("Failed to load suite run data");
      }
    } catch (error: any) {
      messageApi.error("Failed to load suite run data");
    } finally {
      setLoading(false);
    }
  };

  const getHealingSuggestions = async () => {
    const token = await getToken({ template: "basic" });
    if (!token) {
      router.push("/sign-in");
      return;
    }
    
    setHealingSuggestionsLoading(true);
    try {
      const response = await getHealingSuggestionsAPI(
        token,
        suiteId,
        suiteRunId
      );
      if (response.status === 200) {
        const suggestions = response.data?.healing_suggestions || [];
        setHealingSuggestionsData(suggestions);
        // Create a map for quick lookup by ID
        const map: {[key: string]: any} = {};
        suggestions.forEach((suggestion: any) => {
          if (suggestion.id) {
            map[suggestion.id] = suggestion;
          }
        });
        setHealingSuggestionsMap(map);
      } else {
        messageApi.error("Failed to load healing suggestions");
      }
    } catch (error: any) {
      messageApi.error("Failed to load healing suggestions");
    } finally {
      setHealingSuggestionsLoading(false);
    }
  };

  useEffect(() => {
    getSuiteData();
    getSuiteRunData();
    // Also fetch healing suggestions on mount to show count in tab
    getHealingSuggestions();
  }, [suiteId, suiteRunId]);

  

  return (
    <div className="my-5 mx-12 overflow-x-hidden font-hanken">
      {contextHolder}
      {showHeader && (
        <>
        <div className="flex gap-2 items-center mb-5">
          <h1 className="text-[28px] font-normal">Suite Run Report</h1>
          {suiteRunData?.status && (
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-medium ${
                suiteRunData.status === 'completed' ? 'bg-green-100 text-green-800' :
                suiteRunData.status === 'running' ? 'bg-blue-100 text-blue-800' :
                suiteRunData.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {suiteRunData.status}
              </span>
            </div>
          )}
          {currentUserDetails?.role !== 'viewer' && (
            <Tooltip title="Share Suite Run">
              <RoleBasedButton
                type="default"
                icon={<Image src="/assets/share.svg" width={19} height={19} alt="share" />}
                onClick={() => setShowShareModal(true)}
                className="font-hanken bg-white border-2 border-[#DD94FF] !text-[#AE00FF] hover:!bg-white hover:!text-[#AE00FF] hover:!border-[#AE00FF] ml-auto"
                data-testid="suite-run-share-button"
              >
                
              </RoleBasedButton>
            </Tooltip>
          )}
          </div>
          <p className="text-[14px] font-normal mb-3">
            Suite: {suiteData?.name ? (
              <Link 
                href={`/dashboard/suite/${suiteId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {suiteData.name}
              </Link>
            ) : (
              <div className="inline-block">
                <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
              </div>
            )}
          </p>
          <p className="text-[14px] font-normal mb-3">Suite Run ID: {suiteRunId}</p>
          {suiteRunData?.environment_name && (
            <p className="text-[14px] font-normal mb-3">Environment: {suiteRunData.environment_name}</p>
          )}
          {suiteRunData?.config && (
            <p className="text-[14px] font-normal mb-3">
              Config: {suiteRunData.config.browser} | {suiteRunData.config.device?.type} | {suiteRunData.config.viewport?.width} x {suiteRunData.config.viewport?.height}
            </p>
          )}
          {suiteRunData?.tag_filter && (
            <div className="text-[14px] font-normal mb-3">
             
              <span className="mr-2">
                Condition: <span className="font-semibold">{suiteRunData.tag_filter.condition === 'contains_any' ? 'Contains Any' : 'Does Not Contain Any'}</span>
              </span>
              {suiteRunData.tag_filter.tags && suiteRunData.tag_filter.tags.length > 0 && (
                <span className="flex items-center gap-1 flex-wrap">
                  <span>Tags:</span>
                  {suiteRunData.tag_filter.tags.map((tag: string, index: number) => (
                    <Tag key={index} className="font-hanken">
                      {tag}
                    </Tag>
                  ))}
                </span>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Suite Run Summary */}
      {suiteRunData && (
        <div className="mb-6 p-4 bg-white border rounded-md shadow-sm">
       
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-[24px] font-bold text-green-600">
                {suiteRunData.success_count || 0}
              </div>
              <div className="text-[12px] text-gray-600">Success</div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold text-red-600">
                {suiteRunData.failure_count || 0}
              </div>
              <div className="text-[12px] text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold text-orange-600">
                {suiteRunData.error_count || 0}
              </div>
              <div className="text-[12px] text-gray-600">Errors</div>
            </div>
          </div>
          
        </div>
      )}
      
      {/* Tabs for Test Runs and Errors */}
      <Tabs
        defaultActiveKey="testruns"
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={[
          {
            key: 'testruns',
            label: `Test Runs (${(suiteRunData?.success_count || 0) + (suiteRunData?.failure_count || 0)})`,
            children: (
              <LogsComponent
                type="suite"
                id={suiteId}
                suiteId={suiteId}
                suiteRunId={suiteRunId}
              />
            ),
          },
          {
            key: 'errors',
            label: `Test Errors (${suiteRunData?.error_count || 0})`,
            children: errorsData.length > 0 ? (
              <div>
                <Table
                  className="font-hanken rounded-none [&_.ant-table-thead>tr>th:first-child]:rounded-none [&_.ant-table-thead>tr>th:first-child]:[border-start-start-radius:0px]"
                  size="small"
                  columns={errorsColumns}
                  dataSource={errorsData}
                  rowKey={(record, index) => record?.key ?? record?.testId ?? `error-${index}`}
                  pagination={false}
                />
              </div>
            ) : (
              <div className=" text-center text-gray-500">
                No errors found for this suite run.
              </div>
            ),
          },
          {
            key: 'triageResults',
            label: `Triage Results (${suiteRunData?.triage_count || 0})`,
            children: renderTriageTable(triageData, false, "No triage results found for this suite run."),
          },
          {
            key: 'healingSuggestions',
            label: (
              <span>
                Healing Suggestions ({healingSuggestionsData.length || 0}){' '}
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded">
                  Beta
                </span>
              </span>
            ),
            children: renderTriageTable(transformedHealingSuggestionsData, healingSuggestionsLoading, "No healing suggestions found for this suite run.", handleHealingSuggestionRowClick, healingSuggestionsColumns),
          }
        ]}
      />
      
      {/* Share Suite Run Modal */}
      <SendInviteModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        orgId={currentUserDetails?.org_id || ""}
        resourceType="suite_run"
        resourceId={suiteRunId}
        resourceUrl={typeof window !== 'undefined' ? window.location.href : null}
        getToken={async () => {
          const token = await getToken({ template: "basic" });
          if (!token) {
            router.push("/sign-in");
          }
          return token;
        }}
        title="Share Suite Run"
      />
    </div>
  );
} 