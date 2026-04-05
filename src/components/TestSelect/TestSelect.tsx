"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Select, Spin, message } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getTestSuiteAPI } from "@/lib/apis/testAI/test";
import { extractErrorMessage } from "@/lib/utils";

interface TestSelectProps {
  value?: string;
  onChange?: (testId: string) => void;
  suiteId: string;
  placeholder?: string;
  className?: string;
}

export default function TestSelect({
  value,
  onChange,
  suiteId,
  placeholder = "Choose a test",
  className = "w-full",
}: TestSelectProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [testSearchLoading, setTestSearchLoading] = useState(false);
  const testSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load available tests - fetch all tests without pagination
  const loadAvailableTests = useCallback(async (searchQuery?: string) => {
    setTestSearchLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) {
      router.push("/sign-in");
      return;
    }

    try {
      // Fetch all tests with a very high limit (no pagination) and optional search query
      const response = await getTestSuiteAPI(token, suiteId, 1, 10000, searchQuery);
      if (response.status === 200) {
        setAvailableTests(response.data.tests || []);
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setTestSearchLoading(false);
    }
  }, [suiteId, getToken, router, messageApi]);

  // Handle test search with debouncing (500ms)
  const handleTestSearch = useCallback((searchValue: string) => {
    // Clear any existing timeout
    if (testSearchTimeoutRef.current) {
      clearTimeout(testSearchTimeoutRef.current);
    }
    // Debounce the search - call API after user stops typing for 500ms
    testSearchTimeoutRef.current = setTimeout(() => {
      loadAvailableTests(searchValue || undefined);
    }, 500);
  }, [loadAvailableTests]);

  // Load tests on mount
  useEffect(() => {
    loadAvailableTests();
    
    // Cleanup timeout on unmount
    return () => {
      if (testSearchTimeoutRef.current) {
        clearTimeout(testSearchTimeoutRef.current);
      }
    };
  }, [loadAvailableTests]);

  const handleChange = (testId: string) => {
    if (onChange) {
      onChange(testId);
    }
  };

  return (
    <>
      {contextHolder}
      <Select
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={className}
        showSearch
        loading={testSearchLoading}
        onSearch={handleTestSearch}
        filterOption={false}
        notFoundContent={testSearchLoading ? <Spin size="small" /> : "No tests found"}
      >
        {availableTests.map((test) => (
          <Select.Option key={test.id} value={test.id}>
            {test.name}
          </Select.Option>
        ))}
      </Select>
    </>
  );
}

