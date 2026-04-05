'use client'
import type { TablePaginationConfig } from "antd/es/table";
import { Table, message, Button, Spin, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import JSONPretty from "react-json-pretty";
import { liveTestRunAPI } from "@/lib/apis/testAI/test";
import { getTestRunsBulkAPI, getTestRunsAPI, getTestRunsForSuiteRunAPI } from "@/lib/apis/testAI/test";
import { ExportOutlined, LeftOutlined, ReloadOutlined, XFilled } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { extractErrorMessage, formatTimestamp } from "@/lib/utils";

const customStyles = `
  .ant-table-wrapper .ant-table-container table>thead>tr:first-child >*:first-child {
    border-start-start-radius: 0px !important;
  }
  .ant-table-wrapper .ant-table-container table>thead>tr:first-child >*:last-child {
    border-start-end-radius: 0px !important;
  }
`;

interface LogsComponentProps {
  type: "test" | "suite";
  id: string;
  suiteId?: string;
  suiteRunId?: string;
  triggerGetTestRuns?: boolean;
  testRunId?: string;
  onTriggerProcessed?: () => void;
}

// Helper function to manage instruction numbering
const createInstructionNumberManager = () => {
  const instructionIdToNumber = new Map<string, number>();
  let nextInstructionNumber = 1;

  return {
    getInstructionNumber: (instructionId: string): number => {
      let instructionNumber = instructionIdToNumber.get(instructionId);
      if (instructionNumber === undefined) {
        instructionNumber = nextInstructionNumber++;
        instructionIdToNumber.set(instructionId, instructionNumber);
      }
      return instructionNumber;
    }
  };
};

export default function LogsComponent({ type, id, suiteId, suiteRunId, triggerGetTestRuns, testRunId, onTriggerProcessed }: LogsComponentProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [testsLoading, setTestsLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [tests, setTests] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [testLoading, setTestLoading] = useState<boolean>(true);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const [traceLoading, setTraceLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 100,
    total: 0,
    placement: ["bottomEnd"],
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} items`,
  });

  const countRef = useRef(0);

  useEffect(() => {
    countRef.current = 0;
  }, [testRunId, selectedRow?.testrun_id]);

  const liveTestStream = useQuery({
    queryKey: ["liveTestStream", selectedRow?.testrun_id ?? testRunId],
    queryFn: async () => {
      countRef.current++;
      const token = await getToken({ template: "basic" });
      if (!token) {
        router.push("/sign-in");
        throw new Error("Authentication required");
      }
      return liveTestRunAPI(token, selectedRow?.testrun_id ?? testRunId);
    },
    enabled: test?.status === "running", // Disable automatic refetching
    refetchInterval: () => {
      if (countRef.current < 5) {

        return 5000;
      }
      return false;
    }
  });

  //Poll for live stream URL
  // useEffect(() => {


  //   const pollInterval = setInterval(() => {
  //     if (!selectedRow?.testrun_id && !testRunId) return;
  //     // Don't refetch if we got a 500 error
  //     if (liveTestStream.data?.status !== 200 && liveTestStream.data?.status !== 404) {
  //       return;
  //     }
  //     // if(!testRunId){
  //     //   return;
  //     // }
  //     if (!liveTestStream.data?.data?.live_stream_url) {
  //       liveTestStream.refetch();
  //     }
  //   }, 5000);

  //   return () => clearInterval(pollInterval);
  // }, []);

  const getTestRun = async () => {
    const token = await getToken({ template: "basic" });
    if (!token) {
      router.push("/sign-in");
      return;
    }
    setTestLoading(true);
    // Clear previous logs when switching test runs
    setLogs([]);
    try {
      const response = await getTestRunsAPI(token, selectedRow?.testrun_id ?? testRunId);
      if (response.status === 200) {
        setTest(response.data);
        setTestLoading(false);
      } else {
        messageApi.error(extractErrorMessage(response));
        setTestLoading(false);
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
      setTestLoading(false);
    }
  };

  const refreshLogs = async () => {
    if (!selectedRow?.testrun_id && !testRunId) return;

    setLogsLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      const response = await getTestRunsAPI(token, selectedRow?.testrun_id ?? testRunId);
      if (response.status === 200) {
        setTest(response.data);
        messageApi.open({
          type: "success",
          content: "Logs refreshed successfully",
          duration: 3,
        });
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (testRunId) {
      getTestRun();
    } else if (triggerGetTestRuns) {
      (async () => {
        try {
          await getTestRuns();
        } finally {
          // Reset the trigger after processing completes
          onTriggerProcessed?.();
        }
      })();
    }
  }, [triggerGetTestRuns, testRunId, onTriggerProcessed]);

  useEffect(() => {
    if (type === "test" && !testRunId) {
      getTestRuns();
    } else if (type === "suite" && suiteId && suiteRunId) {
      getTestRunsForSuiteRun();
    }
  }, [pagination?.current, type, suiteId, suiteRunId, testRunId]);

  const columns = type === "suite" ? [
    {
      title: "Test ID",
      dataIndex: "custom_test_id",
      key: "custom_test_id",
      render: (text: string, record: any) => (
        <p className="font-hanken text-[14px]">{record.custom_test_id || "-"}</p>
      ),
    },
    {
      title: "Test Name",
      dataIndex: "testName",
      key: "testName",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-2">
          <p className="font-hanken text-[14px]">{text}</p>
          <Tooltip title="Go to test">
            <Link
              href={`/dashboard/suite/${suiteId}/test/${record?.test_id}`}
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
      title: "Run ID",
      dataIndex: "key",
      key: "key",
      render: (text: string) => (
        <p className="font-hanken text-[14px]">{text}</p>
      ),
    },
    {
      title: "Result",
      dataIndex: "result",
      key: "result",
      render: (text: string) => (
        <Tooltip
          placement="topLeft"
          title={text}
        >
          <p className="font-hanken">
            {text === "success" || text === "completed" ? (
              <XFilled className="text-[#20AD4C] w-[16px] h-[16px]" />
            ) : text === "failed" ? (
              <XFilled className="text-[#EA3962] w-[16px] h-[16px]" />
            ) : text === "running" ? (
              <XFilled className="text-[#FFB231] w-[16px] h-[16px]" />
            ) : (
              <XFilled className="text-[#D9D9D9] w-[16px] h-[16px]" />
            )}
          </p>
        </Tooltip>
      ),
    },
    {
      title: "Mode",
      dataIndex: "mode",
      key: "mode",
      render: (text: string) => (
        <p className="font-hanken text-[14px]">{text || ""}</p>
      ),
    },
    {
      title: "Data Index",
      dataIndex: "dataRowIndex",
      key: "dataRowIndex",
      render: (text: any) => (
        <p className="font-hanken text-[14px]">{text || ""}</p>
      ),
    },
    {
      title: "Run at",
      dataIndex: "timeStamp",
      key: "timeStamp",
      render: (text: string) => (
        <p className="font-hanken text-[14px]">{text}</p>
      ),
    },
    {
      title: "Time (s)",
      dataIndex: "duration",
      key: "duration",
      render: (text: string) => (
        <p className="font-hanken text-[14px]">{text}</p>
      ),
    },
  ] : [
    {
      title: "Run ID",
      dataIndex: "key",
      key: "key",
      render: (text: string) => (
        <p className="font-hanken text-[14px]">{text}</p>
      ),
    },
    {
      title: "Result",
      dataIndex: "result",
      key: "result",
      render: (text: string) => (
        <Tooltip
          placement="topLeft"
          title={text}
        >
          <p className="font-hanken">
            {text === "success" || text === "completed" ? (
              <XFilled className="text-[#20AD4C] w-[16px] h-[16px]" />
            ) : text === "failed" ? (
              <XFilled className="text-[#EA3962] w-[16px] h-[16px]" />
            ) : text === "running" ? (
              <XFilled className="text-[#FFB231] w-[16px] h-[16px]" />
            ) : (
              <XFilled className="text-[#D9D9D9] w-[16px] h-[16px]" />
            )}
          </p>
        </Tooltip>
      ),
    },
    {
      title: "Mode",
      dataIndex: "mode",
      key: "mode",
      render: (text: string) => (
        <p className="font-hanken text-[14px]">{text || ""}</p>
      ),
    },
    {
      title: "Data Index",
      dataIndex: "dataRowIndex",
      key: "dataRowIndex",
      render: (text: any) => (
        <p className="font-hanken text-[14px]">{text || ""}</p>
      ),
    },
    {
      title: "Run at",
      dataIndex: "timeStamp",
      key: "timeStamp",
      render: (text: string) => (
        <p className="font-hanken text-[14px]">{text}</p>
      ),
    },
    {
      title: "Time (s)",
      dataIndex: "duration",
      key: "duration",
      render: (text: string) => (
        <p className="font-hanken text-[14px]">{text}</p>
      ),
    },
  ];



  const getTestRuns = async () => {
    setTestsLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      const response = await getTestRunsBulkAPI(
        token,
        pagination?.current,
        pagination?.pageSize,
        id
      );
      if (response.status === 200) {
        setTests(response.data);
        setTestsLoading(false);
        setPagination((prev) => {
          return {
            ...prev,
            total: response?.data?.metadata?.total_records,
          };
        });
        // Don't automatically select the first test run
      } else {
        messageApi.error(extractErrorMessage(response));
        setTestsLoading(false);
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
      setTestsLoading(false);
    }
  };

  const getTestRunsForSuiteRun = async () => {
    setTestsLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      const response = await getTestRunsForSuiteRunAPI(
        token,
        pagination?.current,
        pagination?.pageSize,
        suiteId!,
        suiteRunId!
      );
      if (response.status === 200) {
        setTests(response.data);
        setTestsLoading(false);
        setPagination((prev) => ({
          ...prev,
          total: response?.data?.metadata?.total_records,
        }));
      } else {
        messageApi.error(extractErrorMessage(response));
        setTestsLoading(false);
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
      setTestsLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination?.current,
      pageSize: newPagination?.pageSize || prev.pageSize,
      total: newPagination?.total_records,
    }));
  };

  // const getTestRun = async () => {
  //   const token = await getToken({ template: "basic" });
  //   if (!token) router.push("/sign-in");
  //   setTestLoading(true);
  //   try {
  //     const response = await getTestRunsAPI(token, selectedRow?.testrun_id);
  //     if (response.status === 200) {
  //       setTest(response.data);
  //       setTestLoading(false);
  //     } else {
  //       messageApi.error("There was an error");
  //       setTestLoading(false);
  //     }
  //   } catch (error: any) {
  //     messageApi.error(error);
  //     setTestLoading(false);
  //   }
  // };

  useEffect(() => {
    if (selectedRow) {
      getTestRun();
    }
  }, [selectedRow?.testrun_id]);

  const onRowClick = (record: any) => {
    return {
      onClick: () =>
        setSelectedRow({
          testrun_id: record?.key,
          result: record?.result,
          timeStamp: record?.timeStamp,
        }),
      className:
        selectedRow?.testrun_id === record?.key
          ? `custom-table bg-[#FFF2DB]`
          : `custom-table`,
    };
  };


  const data = tests?.testruns?.map((testrun: any, i: number) => {
    // Calculate duration in seconds
    const calculateDuration = () => {
      if (!testrun?.start_date) return '-';
      if (!testrun?.end_date) return '-';

      const startDate = new Date(testrun.start_date);
      const endDate = new Date(testrun.end_date);
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationSeconds = durationMs / 1000;

      return durationSeconds.toFixed(1);
    };
    return {
      key: testrun?.testrun_id,
      result: testrun?.status,
      timeStamp: formatTimestamp(testrun?.start_date),
      testName: testrun?.test_name,
      dataRowIndex: testrun?.data_row_index,
      test_id: testrun?.test_id,
      mode: testrun?.mode,
      duration: calculateDuration(),
    };
  });




  return (
    <div className="w-full">
      <style>{customStyles}</style>
      {contextHolder}
      {(!testRunId && !selectedRow) ? (
        <div className="overflow-x-hidden pb-4">
          <Table
            className="font-hanken rounded-none cursor-pointer [&_.ant-table-thead>tr>th:first-child]:rounded-none [&_.ant-table-thead>tr>th:first-child]:[border-start-start-radius:0px]"
            size="small"
            onRow={onRowClick}
            loading={testsLoading || triggerGetTestRuns}
            columns={columns}
            dataSource={data}
            rowKey={(record) => record?.key ?? record?.testrun_id ?? ''}
            pagination={pagination}
            onChange={handleTableChange}
          />

        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex border text-[14px] justify-around w-full h-[40px] items-center bg-white rounded-md shadow">
            {!testRunId && (
              <div className="flex gap-1 cursor-pointer" onClick={() => setSelectedRow(null)}>
                <LeftOutlined />
              </div>
            )}
            <div className="flex gap-1">
              <p className="font-hanken">{selectedRow?.testrun_id || testRunId}</p>
            </div>
            <div className="flex gap-1">
              <p className="font-hanken">Result:</p>
              <p className="font-hanken">{selectedRow?.result || test?.status}</p>
            </div>
            <div className="flex gap-1">
              <p className="font-hanken">Timestamp:</p>
              <p className="font-hanken">
                {selectedRow?.timeStamp || formatTimestamp(test?.start_date)}
              </p>
            </div>
            {test?.total_tests && (
              <div className="flex gap-1">
                <p className="font-hanken">Total Tests:</p>
                <p className="font-hanken">{test.total_tests}</p>
              </div>
            )}

            {test?.trace_url && (
              <div className="flex gap-1">
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[6px] bg-[#AE00FF] text-white px-2 hover:!text-white py-1 text-[14px] font-hanken"
                  href={`https://trace.playwright.dev/?trace=${test?.trace_url}`}
                >
                  View trace
                </Link>
              </div>
            )}
          </div>
          {testLoading ? (
            <div className="h-[300px] flex justify-center items-center">
              <Spin />
            </div>
          ) : (
            <div className="flex flex-col gap-5 mt-2">
              <div className="flex flex-col gap-2">
                {test?.status === 'running' ? (
                  <>
                    <div className="bg-black p-4 rounded overflow-x-auto overflow-y-hidden w-full min-w-[750px] h-[360px]">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-hanken text-[16px] text-white">Logs:</h3>
                        {(
                          <Tooltip title="Refresh">
                            <Button
                              type="text"
                              icon={<ReloadOutlined />}
                              onClick={refreshLogs}
                              loading={logsLoading}
                              className="!text-white"
                            />
                          </Tooltip>
                        )}
                      </div>
                      <div className="overflow-auto h-[calc(100%-30px)]">
                        {(!test?.logs || (Array.isArray(test.logs) && test.logs.length === 0) || (typeof test.logs === 'object' && Object.keys(test.logs).length === 0)) && (
                          <div className="text-gray-400 text-center mt-4">
                            No logs available. Click refresh to load logs.
                          </div>
                        )}
                        {test?.logs && (
                          // Check if logs is an array (old format) or object (new format)
                          Array.isArray(test.logs) ? (
                            // Old format: array of log objects
                            test.logs.map((log: any, index: number) => (
                              <div key={index} className="text-[#4EC9B0] text-[14px] mb-2">
                                {log.timestamp && <span className="text-gray-500 mr-2">[{log.timestamp}]</span>}
                                {log.info && <span>{log.info}</span>}
                                {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                                {log.error && <span className="text-red-500">{log.error}</span>}
                              </div>
                            ))
                          ) : test.logs.current_logs ? (
                            // New format: current_logs array + failed_attempts
                            (() => {
                              const currentLogs = test.logs.current_logs;
                              const instructionManager = createInstructionNumberManager();
                              const result = [];

                              // Render current_logs
                              const currentLogsElements = currentLogs.map((logEntry: any, index: number) => {
                                // Skip system logs for instruction numbering
                                if (logEntry.instruction === 'system') {
                                  return (
                                    <div key={`current-${index}`} className="mb-4">
                                      <div className="text-[#FFD700] text-[14px] font-medium mb-2">
                                        System:
                                      </div>
                                      {logEntry.logs.map((log: any, logIndex: number) => (
                                        <div key={logIndex} className="text-[#4EC9B0] text-[14px] mb-2 ml-4">
                                          {log.timestamp && <span className="text-gray-500 mr-2">[{log.timestamp}]</span>}
                                          {log.info && <span>{log.info}</span>}
                                          {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                                          {log.error && <span className="text-red-500">{log.error}</span>}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                } else {
                                  // Get or assign instruction number for this instruction ID
                                  const instructionNumber = instructionManager.getInstructionNumber(logEntry.instruction);
                                  return (
                                    <div key={`current-${index}`} className="mb-4">
                                      <div className="text-[#FFD700] text-[14px] font-medium mb-2">
                                        Instruction {instructionNumber}:
                                      </div>
                                      {logEntry.logs.map((log: any, logIndex: number) => (
                                        <div key={logIndex} className="text-[#4EC9B0] text-[14px] mb-2 ml-4">
                                          {log.timestamp && <span className="text-gray-500 mr-2">[{log.timestamp}]</span>}
                                          {log.info && <span>{log.info}</span>}
                                          {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                                          {log.error && <span className="text-red-500">{log.error}</span>}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                              });

                              result.push(...currentLogsElements);

                              // Render failed attempts if they exist
                              Object.keys(test.logs).forEach((key) => {
                                if (key.startsWith('failed_attempt_')) {
                                  const attemptNumber = key.split('_')[2];
                                  const failedAttemptLogs = test.logs[key];

                                  if (Array.isArray(failedAttemptLogs)) {
                                    result.push(
                                      <div key={key} className="mb-4 mt-6 border-t border-gray-600 pt-4">
                                        <div className="text-[#FF6B6B] text-[14px] font-medium mb-2">
                                          Failed Attempt {attemptNumber}:
                                        </div>
                                        {(() => {
                                          const failedAttemptInstructionManager = createInstructionNumberManager();
                                          return failedAttemptLogs.map((logEntry: any, index: number) => {
                                            if (logEntry.instruction === 'system') {
                                              return (
                                                <div key={`${key}-system-${index}`} className="mb-4">
                                                  <div className="text-[#FFD700] text-[14px] font-medium mb-2">
                                                    System:
                                                  </div>
                                                  {logEntry.logs.map((log: any, logIndex: number) => (
                                                    <div key={logIndex} className="text-[#4EC9B0] text-[14px] mb-2 ml-4">
                                                      {log.timestamp && <span className="text-gray-500 mr-2">[{log.timestamp}]</span>}
                                                      {log.info && <span>{log.info}</span>}
                                                      {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                                                      {log.error && <span className="text-red-500">{log.error}</span>}
                                                    </div>
                                                  ))}
                                                </div>
                                              );
                                            } else {
                                              // Get or assign instruction number for this instruction ID in failed attempt
                                              const failedAttemptInstructionNumber = failedAttemptInstructionManager.getInstructionNumber(logEntry.instruction);
                                              return (
                                                <div key={`${key}-${index}`} className="mb-4">
                                                  <div className="text-[#FFD700] text-[14px] font-medium mb-2">
                                                    Instruction {failedAttemptInstructionNumber}:
                                                  </div>
                                                  {logEntry.logs.map((log: any, logIndex: number) => (
                                                    <div key={logIndex} className="text-[#4EC9B0] text-[14px] mb-2 ml-4">
                                                      {log.timestamp && <span className="text-gray-500 mr-2">[{log.timestamp}]</span>}
                                                      {log.info && <span>{log.info}</span>}
                                                      {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                                                      {log.error && <span className="text-red-500">{log.error}</span>}
                                                    </div>
                                                  ))}
                                                </div>
                                              );
                                            }
                                          });
                                        })()}
                                      </div>
                                    );
                                  }
                                }
                              });

                              return result;
                            })()
                          ) : (
                            // Legacy format: object with numbered keys or root object with logs property
                            (() => {
                              const logsData = test.logs.logs || test.logs;
                              return Object.keys(logsData).map((stepKey, idx) => (
                                <div key={stepKey} className="mb-4">
                                  <div className="text-[#FFD700] text-[14px] font-medium mb-2">
                                    {stepKey.startsWith('failed_attempt_') ?
                                      `Failed Attempt ${stepKey.split('_')[2]}:` :
                                      stepKey.startsWith('attempt_') ?
                                        `Attempt ${stepKey.split('_')[1]}:` :
                                        `Instruction ${idx + 1}:`
                                    }
                                  </div>
                                  {Array.isArray(logsData[stepKey]) ? (
                                    // Direct array of logs
                                    logsData[stepKey].map((log: any, index: number) => (
                                      <div key={index} className="text-[#4EC9B0] text-[14px] mb-2 ml-4">
                                        {log.timestamp && <span className="text-gray-500 mr-2">[{log.timestamp}]</span>}
                                        {log.info && <span>{log.info}</span>}
                                        {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                                        {log.error && <span className="text-red-500">{log.error}</span>}
                                      </div>
                                    ))
                                  ) : (
                                    // Nested object with numbered keys (like failed_attempt_1)
                                    Object.keys(logsData[stepKey]).map((nestedKey, idx) => (
                                      <div key={nestedKey} className="ml-4 mb-2">
                                        <div className="text-[#FFA500] text-[12px] font-medium mb-1">
                                          Instruction {idx + 1}:
                                        </div>
                                        {logsData[stepKey][nestedKey].map((log: any, index: number) => (
                                          <div key={index} className="text-[#4EC9B0] text-[14px] mb-2 ml-4">
                                            {log.timestamp && <span className="text-gray-500 mr-2">[{log.timestamp}]</span>}
                                            {log.info && <span>{log.info}</span>}
                                            {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                                            {log.error && <span className="text-red-500">{log.error}</span>}
                                          </div>
                                        ))}
                                      </div>
                                    ))
                                  )}
                                </div>
                              ));
                            })()
                          )
                        )}
                      </div>
                    </div>

                    {liveTestStream.data?.data?.live_stream_url && (
                      <div className="w-full mt-10 relative" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={liveTestStream.data?.data?.live_stream_url}
                          className="absolute top-0 left-0 w-full h-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )
                    }

                  </>
                ) : (
                  <>
                    <p className="font-hanken text-[16px] mb-1 ml-3 font-medium">Mode: {test?.mode}</p>
                    <div className="bg-black p-4 rounded overflow-x-hidden overflow-y-auto w-full min-w-[750px] h-[360px]">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-hanken text-[16px] text-white">Logs:</h3>
                        {(
                          <Tooltip title="Refresh">
                            <Button
                              type="text"
                              icon={<ReloadOutlined />}
                              onClick={refreshLogs}
                              loading={logsLoading}
                              className="!text-white"
                            />
                          </Tooltip>
                          // <Button
                          //   size="small"
                          //   onClick={refreshLogs}
                          //   loading={logsLoading}
                          //   className="bg-[#AE00FF] border-2 border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF] rounded-[6px] text-white font-hanken text-[14px] font-medium"
                          // >
                          //   Refresh
                          // </Button>
                        )}
                      </div>
                      {test?.logs && (
                        // Check if logs is an array (old format) or object (new format)
                        Array.isArray(test.logs) ? (
                          // Old format: array of log objects
                          test.logs.map((log: any, index: number) => (
                            <div key={index} className="text-[#4EC9B0] text-[14px] mb-2">
                              {log.timestamp && <span className="text-gray-500 mr-2">[{log.timestamp}]</span>}
                              {log.info && <span>{log.info}</span>}
                              {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                              {log.error && <span className="text-red-500">{log.error}</span>}
                            </div>
                          ))
                        ) : test.logs.current_logs ? (
                          // New format: current_logs array + failed_attempts
                          (() => {
                            const currentLogs = test.logs.current_logs;
                            const instructionManager = createInstructionNumberManager();
                            const result = [];

                            // Render current_logs
                            const currentLogsElements = currentLogs.map((logEntry: any, index: number) => {
                              // Skip system logs for instruction numbering
                              if (logEntry.instruction === 'system') {
                                return (
                                  <div key={`current-${index}`} className="mb-4">
                                    <div className="text-[#FFD700] text-[14px] font-medium mb-2">
                                      System:
                                    </div>
                                    {logEntry.logs.map((log: any, logIndex: number) => (
                                      <div key={logIndex} className="text-[#4EC9B0] text-[14px] mb-2 ml-4">
                                        {log.timestamp && <span className="text-gray-500 mr-2">[{log.timestamp}]</span>}
                                        {log.info && <span>{log.info}</span>}
                                        {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                                        {log.error && <span className="text-red-500">{log.error}</span>}
                                      </div>
                                    ))}
                                  </div>
                                );
                              } else {
                                // Get or assign instruction number for this instruction ID
                                const instructionNumber = instructionManager.getInstructionNumber(logEntry.instruction);
                                return (
                                  <div key={`current-${index}`} className="mb-4">
                                    <div className="text-[#FFD700] text-[14px] font-medium mb-2">
                                      Instruction {instructionNumber}:
                                    </div>
                                    {logEntry.logs.map((log: any, logIndex: number) => (
                                      <div key={logIndex} className="text-[#4EC9B0] text-[14px] mb-2 ml-4">
                                        {log.timestamp && <span className="text-gray-500 mr-2">[{log.timestamp}]</span>}
                                        {log.info && <span>{log.info}</span>}
                                        {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                                        {log.error && <span className="text-red-500">{log.error}</span>}
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                            });

                            result.push(...currentLogsElements);

                            // Render failed attempts if they exist
                            Object.keys(test.logs).forEach((key) => {
                              if (key.startsWith('failed_attempt_')) {
                                const attemptNumber = key.split('_')[2];
                                const failedAttemptLogs = test.logs[key];

                                if (Array.isArray(failedAttemptLogs)) {
                                  result.push(
                                    <div key={key} className="mb-4 mt-6 border-t border-gray-600 pt-4">
                                      <div className="text-[#FF6B6B] text-[14px] font-medium mb-2">
                                        Failed Attempt {attemptNumber}:
                                      </div>
                                      {(() => {
                                        const failedAttemptInstructionManager = createInstructionNumberManager();
                                        return failedAttemptLogs.map((logEntry: any, index: number) => {
                                          if (logEntry.instruction === 'system') {
                                            return (
                                              <div key={`${key}-system-${index}`} className="mb-4">
                                                <div className="text-[#FFD700] text-[14px] font-medium mb-2">
                                                  System:
                                                </div>
                                                {logEntry.logs.map((log: any, logIndex: number) => (
                                                  <div key={logIndex} className="text-[#4EC9B0] text-[14px] mb-2 ml-4">
                                                    {log.timestamp && <span className="text-gray-500 mr-2">[{log.timestamp}]</span>}
                                                    {log.info && <span>{log.info}</span>}
                                                    {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                                                    {log.error && <span className="text-red-500">{log.error}</span>}
                                                  </div>
                                                ))}
                                              </div>
                                            );
                                          } else {
                                            // Get or assign instruction number for this instruction ID in failed attempt
                                            const failedAttemptInstructionNumber = failedAttemptInstructionManager.getInstructionNumber(logEntry.instruction);
                                            return (
                                              <div key={`${key}-${index}`} className="mb-4">
                                                <div className="text-[#FFD700] text-[14px] font-medium mb-2">
                                                  Instruction {failedAttemptInstructionNumber}:
                                                </div>
                                                {logEntry.logs.map((log: any, logIndex: number) => (
                                                  <div key={logIndex} className="text-[#4EC9B0] text-[14px] mb-2 ml-4">
                                                    {log.timestamp && <span className="text-gray-500 mr-2">[{log.timestamp}]</span>}
                                                    {log.info && <span>{log.info}</span>}
                                                    {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                                                    {log.error && <span className="text-red-500">{log.error}</span>}
                                                  </div>
                                                ))}
                                              </div>
                                            );
                                          }
                                        });
                                      })()}
                                    </div>
                                  );
                                }
                              }
                            });

                            return result;
                          })()
                        ) : (
                          // Legacy format: object with numbered keys or root object with logs property
                          (() => {
                            const logsData = test.logs.logs || test.logs;
                            return Object.keys(logsData).map((stepKey, idx) => (
                              <div key={stepKey} className="mb-4">
                                <div className="text-[#FFD700] text-[14px] font-medium mb-2">
                                  {stepKey.startsWith('failed_attempt_') ?
                                    `Failed Attempt ${stepKey.split('_')[2]}:` :
                                    stepKey.startsWith('attempt_') ?
                                      `Attempt ${stepKey.split('_')[1]}:` :
                                      `Instruction ${idx + 1}:`
                                  }
                                </div>
                                {Array.isArray(logsData[stepKey]) ? (
                                  // Direct array of logs
                                  logsData[stepKey].map((log: any, index: number) => (
                                    <div key={index} className="text-[#4EC9B0] text-[14px] mb-2 ml-4">
                                      {log.timestamp && <span className="text-gray-500 mr-2">[{log.timestamp}]</span>}
                                      {log.info && <span>{log.info}</span>}
                                      {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                                      {log.error && <span className="text-red-500">{log.error}</span>}
                                    </div>
                                  ))
                                ) : (
                                  // Nested object with numbered keys (like failed_attempt_1)
                                  Object.keys(logsData[stepKey]).map((nestedKey, idx) => (
                                    <div key={nestedKey} className="ml-4 mb-2">
                                      <div className="text-[#FFA500] text-[12px] font-medium mb-1">
                                        Instruction {idx + 1}:
                                      </div>
                                      {logsData[stepKey][nestedKey].map((log: any, index: number) => (
                                        <div key={index} className="text-[#4EC9B0] text-[14px] mb-2 ml-4">
                                          {log.timestamp && <span className="text-gray-500 mr-2">[{log.timestamp}]</span>}
                                          {log.info && <span>{log.info}</span>}
                                          {log.warning && <span className="text-yellow-500">{log.warning}</span>}
                                          {log.error && <span className="text-red-500">{log.error}</span>}
                                        </div>
                                      ))}
                                    </div>
                                  ))
                                )}
                              </div>
                            ));
                          })()
                        )
                      )}
                      {test?.output && (
                        <div className="mt-4 pt-4 border-t border-gray-600">
                          <div className="text-white text-[16px] font-medium mb-2">
                            Result:
                          </div>
                          <div className="text-white text-[14px] ml-4">
                            {test.output}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {test?.gif_url && (
                <div className="mb-5 relative w-full aspect-video bg-white shadow-[0px_2px_3px_0px_rgba(0,0,0,0.3)]">
                  <Image
                    src={test?.gif_url}
                    alt="result gif"
                    fill={true}
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 