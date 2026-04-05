"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { message, Spin, Card, Tag, Divider, Button, Alert, Modal } from "antd";
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { getHealingSuggestionsAPI, updateHealingSuggestionAPI } from "@/lib/apis/testAI/test";
import Link from "next/link";

export default function HealingSuggestionPage() {
  const params = useParams();
  const suite_id = params?.suite_id as string;
  const suite_run_id = params?.suite_run_id as string;
  const healing_suggestion_id = params?.healing_suggestion_id as string;
  const { getToken } = useAuth();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState<boolean>(true);
  const [healingSuggestion, setHealingSuggestion] = useState<any>(null);
  const [instructionDecisions, setInstructionDecisions] = useState<{[key: string]: 'accepted' | 'rejected'}>({});
  const [updating, setUpdating] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [pendingInstructions, setPendingInstructions] = useState<any[]>([]);

  useEffect(() => {
    const fetchHealingSuggestion = async () => {
      const token = await getToken({ template: "basic" });
      if (!token) {
        router.push("/sign-in");
        return;
      }

      setLoading(true);
      try {
        const response = await getHealingSuggestionsAPI(token, suite_id, suite_run_id);
        console.log(response, 'response')
        if (response.status === 200) {
          const suggestions = response.data?.healing_suggestions || [];
          const found = suggestions.find((s: any) => s.id === healing_suggestion_id);
          if (found) {
            setHealingSuggestion(found);
          } else {
            messageApi.error("Healing suggestion not found");
          }
        } else {
          messageApi.error("Failed to load healing suggestion");
        }
      } catch (error: any) {
        messageApi.error("Failed to load healing suggestion");
      } finally {
        setLoading(false);
      }
    };

    fetchHealingSuggestion();
  }, [suite_id, suite_run_id, healing_suggestion_id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin/>
      </div>
    );
  }

  if (!healingSuggestion) {
    return (
      <div className="my-5 mx-12">
        <div className="text-center text-gray-500">
          Healing suggestion not found
        </div>
      </div>
    );
  }

  const triageResult = healingSuggestion.triage_result;
  const currentTest = healingSuggestion.current_test;
  const status = healingSuggestion.status;
  // Status values: accepted, rejected, completed, running, failed
  const statusLower = status?.toLowerCase();
  // Use updated_test for accepted/rejected status, otherwise use suggested_test
  const isAcceptedOrRejected = statusLower === "accepted" || statusLower === "rejected";

  // Use updated_test if status is Accepted/Rejected, otherwise use suggested_test
  const comparisonTest = isAcceptedOrRejected 
    ? healingSuggestion.updated_test 
    : healingSuggestion.suggested_test;

  // Create a map of current test instructions by ID for quick lookup
  const currentInstMap = currentTest?.instructions 
    ? new Map(currentTest.instructions.map((inst: any) => [inst.id, inst]))
    : new Map();

  // Check if test has been updated and healing suggestions cannot be applied
  // Only check this if status is not Accepted/Rejected (i.e., we're using suggested_test)
  const checkIfTestUpdated = () => {
    if (isAcceptedOrRejected) {
      return false; // Don't check if already accepted/rejected
    }

    if (!currentTest?.instructions || !comparisonTest?.instructions) {
      return false;
    }

    // Create a map of current test instruction IDs for quick lookup
    const currentInstructionIds = new Set(
      currentTest.instructions.map((inst: any) => inst.id).filter(Boolean)
    );

    // Check if any suggested instruction with edit_type "update" or "delete" doesn't exist in current test
    // Note: "new" instructions are new and shouldn't exist in current_test, so we skip them
    const hasMismatch = comparisonTest.instructions.some((suggestedInst: any) => {
      // Only check instructions that have been updated or deleted (not "unchanged" or "new")
      if (suggestedInst.edit_type && 
          suggestedInst.edit_type !== "unchanged" && 
          suggestedInst.edit_type !== "new") {
        // If the instruction has an ID, check if it exists in current test
        // For "update" or "delete" instructions, they should exist in current_test
        if (suggestedInst.id) {
          return !currentInstructionIds.has(suggestedInst.id);
        }
        // If no ID, we can't match it, so consider it a potential issue
        return true;
      }
      return false;
    });

    return hasMismatch;
  };

  const testHasBeenUpdated = checkIfTestUpdated();

  const handleAcceptInstruction = (instructionId: string) => {
    setInstructionDecisions(prev => ({
      ...prev,
      [instructionId]: 'accepted'
    }));
  };

  const handleRejectInstruction = (instructionId: string) => {
    setInstructionDecisions(prev => ({
      ...prev,
      [instructionId]: 'rejected'
    }));
  };

  // Check for pending instructions that need decisions
  const getPendingInstructions = () => {
    if (!currentTest?.instructions || !comparisonTest?.instructions) {
      return [];
    }

    const pending: any[] = [];
    
    comparisonTest.instructions.forEach((comparisonInst: any, index: number) => {
      const editType = comparisonInst.edit_type;
      const currentInst = comparisonInst.id ? currentInstMap.get(comparisonInst.id) : null;
      
      // Check for updated instructions without decisions
      if (editType === 'update' && currentInst) {
        const decision = instructionDecisions[currentInst.id];
        if (!decision) {
          pending.push({
            serialNumber: index + 1,
            type: 'update',
            action: comparisonInst.action,
            id: currentInst.id
          });
        }
      }
      
      // Check for new instructions without decisions
      if (editType === 'new') {
        const newInstKey = `new-${comparisonInst.id || index}`;
        const decision = instructionDecisions[newInstKey];
        if (!decision) {
          pending.push({
            serialNumber: index + 1,
            type: 'new',
            action: comparisonInst.action,
            id: newInstKey
          });
        }
      }
      
      // Check for deleted instructions without decisions
      if (editType === 'delete' && currentInst) {
        const deletedInstKey = `deleted-${comparisonInst.id || index}`;
        const decision = instructionDecisions[deletedInstKey];
        if (!decision) {
          pending.push({
            serialNumber: index + 1,
            type: 'delete',
            action: currentInst.action,
            id: deletedInstKey
          });
        }
      }
    });
    
    return pending;
  };

  // Check if all healing suggestions are rejected
  const areAllSuggestionsRejected = () => {
    if (!currentTest?.instructions || !comparisonTest?.instructions) {
      return false;
    }

    const changedInstructions: any[] = [];
    
    comparisonTest.instructions.forEach((comparisonInst: any, index: number) => {
      const editType = comparisonInst.edit_type;
      const currentInst = comparisonInst.id ? currentInstMap.get(comparisonInst.id) : null;
      
      // Only check instructions that have changes (not unchanged)
      if (editType === 'update' && currentInst) {
        changedInstructions.push({
          key: currentInst.id,
          decision: instructionDecisions[currentInst.id]
        });
      } else if (editType === 'new') {
        const newInstKey = `new-${comparisonInst.id || index}`;
        changedInstructions.push({
          key: newInstKey,
          decision: instructionDecisions[newInstKey]
        });
      } else if (editType === 'delete' && currentInst) {
        const deletedInstKey = `deleted-${comparisonInst.id || index}`;
        changedInstructions.push({
          key: deletedInstKey,
          decision: instructionDecisions[deletedInstKey]
        });
      }
    });
    
    // If there are no changed instructions, return false
    if (changedInstructions.length === 0) {
      return false;
    }
    
    // Check if all changed instructions are rejected
    return changedInstructions.every(inst => inst.decision === 'rejected');
  };

  const allRejected = areAllSuggestionsRejected();

  const handleApplyChanges = async () => {
    if (testHasBeenUpdated) {
      messageApi.warning("The test has been updated. Healing suggestions cannot be applied.");
      return;
    }

    // Check for pending instructions
    const pending = getPendingInstructions();
    if (pending.length > 0) {
      setPendingInstructions(pending);
      setShowConfirmModal(true);
      return;
    }

    // Proceed with applying changes if no pending instructions
    await applyChanges();
  };

  const applyChanges = async () => {
    const token = await getToken({ template: "basic" });
    if (!token) {
      router.push("/sign-in");
      return;
    }

    setUpdating(true);
    try {
      // Helper function to remove edit_type from instruction
      const removeEditType = (instruction: any) => {
        const { edit_type, ...rest } = instruction;
        return rest;
      };

      // Build the updated_test with accepted/rejected instructions
      // Iterate over comparisonTest instructions to handle all types (updated, added, deleted)
      const finalInstructions: any[] = [];
      
      comparisonTest.instructions.forEach((comparisonInst: any, index: number) => {
        const editType = comparisonInst.edit_type;
        const currentInst = comparisonInst.id ? currentInstMap.get(comparisonInst.id) : null;
        
        // Handle unchanged instructions - always include from current_test
        if (editType === 'unchanged' && currentInst) {
          finalInstructions.push(removeEditType(currentInst));
        }
        // Handle updated instructions
        else if (editType === 'update' && currentInst) {
          const decision = instructionDecisions[currentInst.id];
          if (decision === 'accepted') {
            finalInstructions.push(removeEditType(comparisonInst));
          } else {
            // If rejected or no decision, keep current
            finalInstructions.push(removeEditType(currentInst));
          }
        }
        // Handle new instructions
        else if (editType === 'new') {
          const newInstKey = `new-${comparisonInst.id || index}`;
          const decision = instructionDecisions[newInstKey];
          if (decision === 'accepted') {
            finalInstructions.push(removeEditType(comparisonInst));
          }
          // If rejected or no decision, don't add it
        }
        // Handle deleted instructions
        else if (editType === 'delete' && currentInst) {
          const deletedInstKey = `deleted-${comparisonInst.id || index}`;
          const decision = instructionDecisions[deletedInstKey];
          if (decision === 'accepted') {
            // Don't add it (it's deleted)
          } else {
            // If rejected or no decision, keep the current instruction
            finalInstructions.push(removeEditType(currentInst));
          }
        }
      });

      // Determine status: if all suggestions are rejected, send "rejected", otherwise "accepted"
      const finalStatus = allRejected ? "rejected" : "accepted";

      const response = await updateHealingSuggestionAPI(token, suite_id, healing_suggestion_id, {
        status: finalStatus,
        updated_test: {
          instructions: finalInstructions
        }
      });

      if (response.status === 200) {
        if (allRejected) {
          messageApi.success("All healing changes have been rejected");
        } else {
          messageApi.success("Healing suggestion applied successfully");
        }
        // Update healing suggestion with the response data which includes updated_test and status
        if (response.data) {
          // Get status and updated_test from the response
          const responseStatus = response.data.status;
          const responseUpdatedTest = response.data.updated_test;
          console.log('Response status:', responseStatus);
          console.log('Response updated_test:', responseUpdatedTest);
          console.log('Response data:', response.data);
          
          // Merge response data with existing healing suggestion, ensuring status and updated_test are from response
          const updatedSuggestion = {
            ...healingSuggestion,
            ...response.data,
            status: responseStatus, // Use status from response
            updated_test: responseUpdatedTest // Use updated_test from response, fallback to existing
          };
          console.log('Updated healing suggestion:', updatedSuggestion);
          console.log('Updated test instructions:', updatedSuggestion.updated_test?.instructions);
          setHealingSuggestion(updatedSuggestion);
          setInstructionDecisions({});
        } else {
          // Fallback: refresh the data if response.data is not available
          const refreshResponse = await getHealingSuggestionsAPI(token, suite_id, suite_run_id);
          if (refreshResponse.status === 200) {
            const suggestions = refreshResponse.data?.healing_suggestions || [];
            const found = suggestions.find((s: any) => s.id === healing_suggestion_id);
            if (found) {
              // Use status from the found suggestion
              setHealingSuggestion(found);
              setInstructionDecisions({});
            }
          }
        }
      } else {
        messageApi.error("Failed to apply healing suggestion");
      }
    } catch (error: any) {
      messageApi.error(error.message || "Failed to apply healing suggestion");
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmApply = async () => {
    setShowConfirmModal(false);
    await applyChanges();
  };

  const handleCancelApply = () => {
    setShowConfirmModal(false);
    setPendingInstructions([]);
  };

  // Helper function to render final instruction (after apply, no edit_type)
  const renderFinalInstruction = (instruction: any, serialNumber: number) => {
    // Get playwright script from playwright_instructions if available (for accepted/rejected status)
    // Otherwise fall back to playwright_actions in the instruction
    let playwrightScript = null;
    if (comparisonTest?.playwright_instructions && instruction?.id) {
      const scripts = comparisonTest.playwright_instructions[instruction.id];
      if (scripts && scripts.length > 0) {
        playwrightScript = scripts[0];
      }
    }
    if (!playwrightScript && instruction?.playwright_actions?.[0]) {
      playwrightScript = instruction.playwright_actions[0];
    }

    return (
      <div key={instruction.id || serialNumber} className="mb-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
            {serialNumber}
          </span>
          <span className="font-semibold">Action: {instruction?.action}</span>
        </div>
        <div className="text-sm text-gray-700">
          {instruction?.prompt && (
            <div className="mb-2">
              <span className="font-medium">Prompt:</span> {instruction.prompt}
            </div>
          )}
          {playwrightScript && (
            <div className="font-mono bg-white p-2 rounded border border-gray-300 break-words overflow-wrap-anywhere whitespace-pre-wrap">
              {playwrightScript}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper function to render instruction diff side by side
  const renderInstructionDiff = (current: any, comparison: any, index: number, serialNumber?: number) => {
    if (!current && !comparison) return null;

    const instructionId = current?.id || `inst-${index}`;
    const currentAction = current?.playwright_actions?.[0] || "";
    const comparisonAction = comparison?.playwright_actions?.[0] || "";
    const currentPrompt = current?.prompt || "";
    const comparisonPrompt = comparison?.prompt || "";
    const decision = instructionDecisions[instructionId];
    const isChanged = currentAction !== comparisonAction || currentPrompt !== comparisonPrompt;
    const rightColumnLabel = isAcceptedOrRejected ? (statusLower === "accepted" ? "Applied" : "Rejected") : "Suggested";

    return (
      <div className={`mb-4 p-4 rounded-lg border ${isChanged ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {serialNumber !== undefined && (
              <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
                {serialNumber}
              </span>
            )}
            <span className="font-semibold">Action: {current?.action || comparison?.action}</span>
            {comparison?.edit_type && (
              <Tag color={comparison.edit_type === 'update' ? 'orange' : comparison.edit_type === 'new' ? 'green' : comparison.edit_type === 'delete' ? 'red' : 'gray'}>
                {comparison.edit_type}
              </Tag>
            )}
            {decision && (
              <Tag color={decision === 'accepted' ? 'green' : 'red'}>
                {decision === 'accepted' ? 'Accepted' : 'Rejected'}
              </Tag>
            )}
          </div>
          {isChanged && !decision && !testHasBeenUpdated && !isAcceptedOrRejected && (
            <div className="flex gap-2">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                onClick={() => handleAcceptInstruction(instructionId)}
                className="!bg-green-600 hover:!bg-green-700"
              >
                Accept
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                onClick={() => handleRejectInstruction(instructionId)}
              >
                Reject
              </Button>
            </div>
          )}
        </div>
        
        {isChanged ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Current (Left) */}
            <div className={`p-3 rounded border ${decision === 'rejected' ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} overflow-hidden`}>
              <div className="text-sm font-medium text-red-600 mb-2">Current</div>
              {currentPrompt && (
                <div className="text-sm text-gray-700 mb-2 break-words">
                  <span className="font-medium">Prompt:</span> {currentPrompt}
                </div>
              )}
              {currentAction && (
                <div className="text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded break-words overflow-wrap-anywhere whitespace-pre-wrap">
                  {currentAction}
                </div>
              )}
            </div>
            
            {/* Comparison (Right) */}
            <div className={`p-3 rounded border ${decision === 'accepted' || isAcceptedOrRejected ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-white'} overflow-hidden`}>
              <div className={`text-sm font-medium mb-2 ${isAcceptedOrRejected && statusLower === "rejected" ? 'text-red-600' : 'text-green-600'}`}>
                {rightColumnLabel}
              </div>
              {comparisonPrompt && (
                <div className="text-sm text-gray-700 mb-2 break-words">
                  <span className="font-medium">Prompt:</span> {comparisonPrompt}
                </div>
              )}
              {comparisonAction && (
                <div className="text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded break-words overflow-wrap-anywhere whitespace-pre-wrap">
                  {comparisonAction}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-700">
            {currentPrompt && <div className="mb-1"><span className="font-medium">Prompt:</span> {currentPrompt}</div>}
            {currentAction && (
              <div className="font-mono bg-white p-2 rounded break-words overflow-wrap-anywhere whitespace-pre-wrap">{currentAction}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="my-5 mx-12 overflow-x-hidden font-hanken">
      {contextHolder}
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/suite/${suite_id}/run/${suite_run_id}`}>
          <ArrowLeftOutlined className="text-[#AE00FF] cursor-pointer hover:text-[#8e00cc] text-xl" />
        </Link>
        <h1 className="text-[28px] font-normal">Healing Suggestion Details</h1>
      </div>
      {/* Triage Result Section */}
      {triageResult && (
        <Card className="mb-6" title="Triage Result">
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Test Name: </span>
              <span>{triageResult.test_name}</span>
            </div>
            <div>
              <span className="font-semibold">Test ID: </span>
              <span>{triageResult.test_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Category: </span>
              <Tag color={
                triageResult.category === 'update_script' ? 'blue' :
                triageResult.category === 'environment_issue' ? 'yellow' :
                'red'
              }>
                {triageResult.category?.replace(/_/g, ' ')}
              </Tag>
              {triageResult.sub_category && (
                <Tag color="blue">{triageResult.sub_category?.replace(/_/g, ' ')}</Tag>
              )}
            </div>
            {triageResult.data_row_index !== null && triageResult.data_row_index !== undefined && (
              <div>
                <span className="font-semibold">Test Data Index: </span>
                <span>{triageResult.data_row_index}</span>
              </div>
            )}
            <div>
              <span className="font-semibold">Reasoning: </span>
              <p className="mt-1 text-gray-700">{triageResult.reasoning}</p>
            </div>
            {triageResult.prompt && (
              <div>
                <span className="font-semibold">Suggested Prompt: </span>
                <p className="mt-1 text-gray-700">{triageResult.prompt}</p>
              </div>
            )}
          </div>
        </Card>
      )}
      {/* Healing Reasoning - Only show if exists and status is not running */}
      {healingSuggestion?.reasoning && statusLower !== "running" && (
        <Card className="mb-6" title="Healing Summary">
          <p className="text-gray-700">{healingSuggestion?.reasoning}</p>
        </Card>
      )}
      {/* Status Messages for Running and Failed */}
      {statusLower === "running" && (
        <Card className="mb-6">
          <Alert
            message="Healing Agent In Progress"
            description="The healing agent is still processing your request. Please come back after some time to view the healing suggestions."
            type="info"
            icon={<ExclamationCircleOutlined />}
            showIcon
          />
        </Card>
      )}
      {statusLower === "failed" && (
        <Card className="mb-6">
          <Alert
            message="Failed to Generate Healing Suggestions"
            description="The healing agent was unable to generate healing suggestions for this test failure."
            type="error"
            icon={<ExclamationCircleOutlined />}
            showIcon
          />
        </Card>
      )}
      {/* Diff Section - Only show if status is not running or failed */}
      {statusLower !== "running" && statusLower !== "failed" && (
      <Card 
        title="Test Changes"
        extra={
          !isAcceptedOrRejected && Object.keys(instructionDecisions).length > 0 && !testHasBeenUpdated && (
            <Button
              type="primary"
              loading={updating}
              onClick={handleApplyChanges}
              className="!bg-[#AE00FF] hover:!bg-[#8e00cc]"
            >
              Apply Changes
            </Button>
          )
        }
      >
        <div className="space-y-4">
          {isAcceptedOrRejected && (
            <Alert
              message={`Healing suggestion ${status}`}
              description={`This healing suggestion has been ${status.toLowerCase()}.`}
              type={statusLower === "accepted" ? "success" : "error"}
              icon={<ExclamationCircleOutlined />}
              showIcon
              className="mb-4"
            />
          )}
          {!isAcceptedOrRejected && testHasBeenUpdated && (
            <Alert
              message="Test Has Been Updated"
              description="The test has been updated since this healing suggestion was created. The healing suggestions cannot be applied."
              type="warning"
              icon={<ExclamationCircleOutlined />}
              showIcon
              className="mb-4"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {isAcceptedOrRejected ? "Instructions" : "Instructions Comparison"}
            </h3>
            {/* Show final instructions if status is Accepted/Rejected (no edit_type) */}
            {isAcceptedOrRejected && comparisonTest?.instructions && comparisonTest.instructions.length > 0 ? (
              <div>
                {comparisonTest.instructions.map((instruction: any, index: number) => {
                  return renderFinalInstruction(instruction, index + 1);
                })}
              </div>
            ) : isAcceptedOrRejected && (
              <div className="text-center text-gray-500 py-8">
                No instructions available
              </div>
            )}
            {/* Show diff view if status is not Accepted/Rejected */}
            {!isAcceptedOrRejected && currentTest?.instructions && comparisonTest?.instructions && (
              <div>
                {/* Iterate over comparison test instructions to show all changes */}
                {comparisonTest.instructions.map((comparisonInst: any, index: number) => {
                  const editType = comparisonInst.edit_type;
                  const currentInst = comparisonInst.id ? currentInstMap.get(comparisonInst.id) : null;
                  
                  // Handle deleted instructions (exist in comparison but not in current)
                  if (editType === 'delete' && !currentInst) {
                    // This shouldn't happen if the data is correct, but handle it
                    return null;
                  }
                  
                  // Handle new instructions (only in comparison, not in current)
                  if (editType === 'new') {
                    const newInstKey = `new-${comparisonInst.id || index}`;
                    const decision = instructionDecisions[newInstKey];
                    const serialNumber = index + 1;
                    return (
                      <div key={newInstKey} className="mb-4 p-4 rounded-lg border border-green-400 bg-green-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
                              {serialNumber}
                            </span>
                          <span className="font-semibold">Action: {comparisonInst?.action}</span>
                          <Tag color="green">new</Tag>

                            {decision && (
                              <Tag color={decision === 'accepted' ? 'green' : 'red'}>
                                {decision === 'accepted' ? 'Accepted' : 'Rejected'}
                              </Tag>
                            )}
                          </div>
                          {!decision && !testHasBeenUpdated && !isAcceptedOrRejected && (
                            <div className="flex gap-2">
                              <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                size="small"
                                onClick={() => handleAcceptInstruction(newInstKey)}
                                className="!bg-green-600 hover:!bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button
                                danger
                                icon={<CloseOutlined />}
                                size="small"
                                onClick={() => handleRejectInstruction(newInstKey)}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                        {comparisonInst?.playwright_actions?.[0] && (
                          <div className="text-sm text-gray-700 font-mono bg-white p-2 rounded mt-1 break-words overflow-wrap-anywhere whitespace-pre-wrap">
                            {comparisonInst.playwright_actions[0]}
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  // Handle deleted instructions (exist in current but marked as deleted in comparison)
                  if (editType === 'delete' && currentInst) {
                    const deletedInstKey = `deleted-${comparisonInst.id || index}`;
                    const decision = instructionDecisions[deletedInstKey];
                    const serialNumber = index + 1;
                    return (
                      <div key={deletedInstKey} className="mb-4 p-4 rounded-lg border border-red-400 bg-red-50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
                              {serialNumber}
                            </span>
                            <span className="font-semibold">Action: {currentInst?.action}</span>
                            <Tag color="red">delete</Tag>
                            {decision && (
                              <Tag color={decision === 'accepted' ? 'green' : 'red'}>
                                {decision === 'accepted' ? 'Accepted' : 'Rejected'}
                              </Tag>
                            )}
                          </div>
                          {!decision && !testHasBeenUpdated && !isAcceptedOrRejected && (
                            <div className="flex gap-2">
                              <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                size="small"
                                onClick={() => handleAcceptInstruction(deletedInstKey)}
                                className="!bg-green-600 hover:!bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button
                                danger
                                icon={<CloseOutlined />}
                                size="small"
                                onClick={() => handleRejectInstruction(deletedInstKey)}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Current (Left) - will be deleted */}
                          <div className={`p-3 rounded border ${decision === 'rejected' ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'} overflow-hidden`}>
                            <div className="text-sm font-medium text-red-600 mb-2">Current (To be deleted)</div>
                            {currentInst?.prompt && (
                              <div className="text-sm text-gray-700 mb-2 break-words">
                                <span className="font-medium">Prompt:</span> {currentInst.prompt}
                              </div>
                            )}
                            {currentInst?.playwright_actions?.[0] && (
                              <div className="text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded break-words overflow-wrap-anywhere whitespace-pre-wrap">
                                {currentInst.playwright_actions[0]}
                              </div>
                            )}
                          </div>
                          {/* Right side - empty for deleted */}
                          <div className="p-3 rounded border border-gray-300 bg-gray-100">
                            <div className="text-sm font-medium text-gray-500 mb-2">delete</div>
                            <div className="text-sm text-gray-400 italic">This instruction will be removed</div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Handle unchanged instructions - skip comparison
                  if (editType === 'unchanged' && currentInst) {
                    const serialNumber = index + 1;
                    return (
                      <div key={currentInst.id || index}>
                        {renderFinalInstruction(currentInst, serialNumber)}
                      </div>
                    );
                  }
                  
                  // Handle updated instructions (exist in both)
                  if (editType === 'update' && currentInst) {
                    const serialNumber = index + 1;
                    return (
                      <div key={currentInst.id || index}>
                        {renderInstructionDiff(currentInst, comparisonInst, index, serialNumber)}
                      </div>
                    );
                  }
                  
                  return null;
                })}
              </div>
            )}
          </div>
        </div>
      </Card>
      )}
      {/* Confirmation Modal for Pending Instructions */}
      <Modal
        title="Pending Instructions"
        open={showConfirmModal}
        onOk={handleConfirmApply}
        onCancel={handleCancelApply}
        okText="Apply Changes"
        cancelText="Cancel"
        okButtonProps={{ className: "!bg-[#AE00FF] hover:!bg-[#8e00cc]" }}
      >
        <div className="my-4">
          <p className="mb-4 text-gray-700">
            You have {pendingInstructions.length} pending instruction{pendingInstructions.length > 1 ? 's' : ''} that haven&apos;t been accepted or rejected. 
            These suggestions will be discarded if you proceed.
          </p>
          <div className="max-h-60 overflow-y-auto">
            <div className="space-y-2">
              {pendingInstructions.map((pending, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {pending.serialNumber}
                    </span>
                    <Tag color={
                      pending.type === 'update' ? 'orange' : 
                      pending.type === 'new' ? 'green' : 
                      'red'
                    }>
                      {pending.type === 'update' ? 'Update' : 
                       pending.type === 'new' ? 'New' : 
                       'Delete'}
                    </Tag>
                    <span className="text-sm font-medium">{pending.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500 italic">
            Click &quot;Apply Changes&quot; to proceed with only the accepted/rejected instructions, or &quot;Cancel&quot; to review the pending instructions.
          </p>
        </div>
      </Modal>
    </div>
  );
}

