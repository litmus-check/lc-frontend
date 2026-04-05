import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { message } from 'antd';
import { actions } from '@/lib/constants/actions';
import { getTestSuiteAPI } from '@/lib/apis/testAI/test';
import { getSegmentsBySuiteAPI } from '@/lib/apis/testAI/segments';
import { getFilesAPI } from '@/lib/apis/testAI/test';
import { getLiveUrlsAPI } from '@/lib/apis/testAI/compose';
import { extractErrorMessage } from '@/lib/utils';
import { clearVerifyFieldsOnTargetChange } from '@/lib/verifyUtils';
import React from 'react';

interface UseActionHandlersProps {
  suite_id?: string;
  test_id?: string;
  composeId: string;
  composeConfig: any;
  selectedAction: string;
  setSelectedAction: (action: string) => void;
  instructionArgs: Record<string, string>;
  setInstructionArgs: (args: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  validationErrors: Record<string, string>;
  setValidationErrors: (errors: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  showValidationErrors: boolean;
  setShowValidationErrors: (show: boolean) => void;
  editSelectedAction: string;
  setEditSelectedAction: (action: string) => void;
  editInstructionArgs: Record<string, string>;
  setEditInstructionArgs: (args: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  editValidationErrors: Record<string, string>;
  setEditValidationErrors: (errors: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  showEditValidationErrors: boolean;
  setShowEditValidationErrors: (show: boolean) => void;
  elementType: 'existing' | 'new';
  setElementType: (type: 'existing' | 'new') => void;
  setVerifyCurrentArgIndex: (index: number) => void;
  setEditVerifyCurrentArgIndex: (index: number) => void;
  setTestSearchQuery: (query: string) => void;
  setAvailableTests: (tests: Array<{ id: string; name: string }>) => void;
  setAvailableSegments: (segments: Array<any>) => void;
  setAvailableFiles: (files: Array<{ file_id: string; file_name: string }>) => void;
  setAvailableLiveUrls: (urls: Array<{ title: string; url: string; live_url: string }>) => void;
  setSuiteTestsLoading: (loading: boolean) => void;
  setSegmentsLoading: (loading: boolean) => void;
  setFilesLoading: (loading: boolean) => void;
  setLiveUrlsLoading: (loading: boolean) => void;
  setAiUse: (use: 'generate_script' | 'always_ai') => void;
  setEditAiUse: (use: 'generate_script' | 'always_ai') => void;
}

export const useActionHandlers = ({
  suite_id,
  test_id,
  composeId,
  composeConfig,
  selectedAction,
  setSelectedAction,
  instructionArgs,
  setInstructionArgs,
  validationErrors,
  setValidationErrors,
  showValidationErrors,
  setShowValidationErrors,
  editSelectedAction,
  setEditSelectedAction,
  editInstructionArgs,
  setEditInstructionArgs,
  editValidationErrors,
  setEditValidationErrors,
  showEditValidationErrors,
  setShowEditValidationErrors,
  elementType,
  setElementType,
  setVerifyCurrentArgIndex,
  setEditVerifyCurrentArgIndex,
  setTestSearchQuery,
  setAvailableTests,
  setAvailableSegments,
  setAvailableFiles,
  setAvailableLiveUrls,
  setSuiteTestsLoading,
  setSegmentsLoading,
  setFilesLoading,
  setLiveUrlsLoading,
  setAiUse,
  setEditAiUse,
}: UseActionHandlersProps) => {
  const { getToken } = useAuth();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const testSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuiteTests = async (searchQuery?: string) => {
    if (!suite_id) {
      messageApi.error("No suite ID available");
      return;
    }

    setSuiteTestsLoading(true);
    try {
      const token = await getToken({ template: "basic" });
      if (!token) {
        router.push("/sign-in");
        return;
      }

      const response = await getTestSuiteAPI(token, suite_id, 1, 10000, searchQuery);
      if (response.status === 200 && response.data.tests) {
        const tests = response.data.tests.filter((test: any) => test.id !== test_id);
        setAvailableTests(tests.map((test: any) => ({
          id: test.id,
          name: test.name
        })));
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setSuiteTestsLoading(false);
    }
  };

  const handleTestSearch = (searchValue: string) => {
    setTestSearchQuery(searchValue);
    if (testSearchTimeoutRef.current) {
      clearTimeout(testSearchTimeoutRef.current);
    }
    testSearchTimeoutRef.current = setTimeout(() => {
      fetchSuiteTests(searchValue || undefined);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (testSearchTimeoutRef.current) {
        clearTimeout(testSearchTimeoutRef.current);
      }
    };
  }, []);

  const fetchSuiteSegments = async () => {
    if (!suite_id) {
      messageApi.error("No suite ID available");
      return;
    }

    setSegmentsLoading(true);
    try {
      const token = await getToken({ template: "basic" });
      if (!token) {
        router.push("/sign-in");
        return;
      }

      const response = await getSegmentsBySuiteAPI(token, suite_id);
      if (response.status === 200 && response.data.test_segments) {
        setAvailableSegments(response.data.test_segments.map((segment: any) => ({
          segment_id: segment.segment_id,
          segment_name: segment.segment_name || 'Unnamed Segment',
          test_id: segment.test_id,
          test_name: segment.test_name || 'Unknown Test',
          start_instruction_id: segment.start_instruction_id,
          end_instruction_id: segment.end_instruction_id
        })));
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setSegmentsLoading(false);
    }
  };

  const fetchSuiteFiles = async () => {
    if (!suite_id) {
      messageApi.error("No suite ID available");
      return;
    }

    setFilesLoading(true);
    try {
      const token = await getToken({ template: "basic" });
      if (!token) {
        router.push("/sign-in");
        return;
      }

      const response = await getFilesAPI(token, suite_id);
      if (response.status === 200 && response.data.files) {
        setAvailableFiles(response.data.files.map((file: any) => ({
          file_id: file.file_id,
          file_name: file.file_name
        })));
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setFilesLoading(false);
    }
  };

  const fetchLiveUrls = async () => {
    if (!composeId) {
      return;
    }

    setLiveUrlsLoading(true);
    try {
      const token = await getToken({ template: 'basic' });
      if (!token) {
        router.push('/sign-in');
        return;
      }
      const response = await getLiveUrlsAPI(token, composeId);
      if (response.status === 200 && Array.isArray(response.data?.live_urls)) {
        const urls = response.data.live_urls.map((item: any) => ({
          title: item.title,
          url: item.url,
          live_url: item.live_url
        }));
        setAvailableLiveUrls(urls);
      } else if (response.status === 200 && Array.isArray(response.data?.tabs)) {
        setAvailableLiveUrls(response.data.tabs);
      } else if (response.status === 200 && Array.isArray(response.data)) {
        setAvailableLiveUrls(response.data);
      } else {
        messageApi.error(extractErrorMessage(response) || 'Failed to fetch live URLs');
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setLiveUrlsLoading(false);
    }
  };

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    setInstructionArgs({});
    setValidationErrors({});
    setShowValidationErrors(false);

    let initialArgs: Record<string, string> = {};

    if (action === 'reuse_test') {
      setTestSearchQuery('');
      fetchSuiteTests();
      fetchSuiteSegments();
    }

    if (action === 'ai_file_upload') {
      fetchSuiteFiles();
    }

    if (action === 'verify') {
      setVerifyCurrentArgIndex(0);
      initialArgs = {
        fail_test: 'true',
        expected_result: 'true'
      };
    }

    if (action === 'ai_assert') {
      initialArgs = {
        fail_test: 'true',
        expected_result: 'true'
      };
    }

    if (action === 'switch_tab') {
      fetchLiveUrls();
      initialArgs.tabSelectionMethod = 'dropdown';
    }

    setInstructionArgs(initialArgs);

    if (actions[action]?.type === 'AI' || (action === 'verify')) {
      setAiUse('generate_script');
    }
  };

  const handleEditActionSelect = (action: string) => {
    setEditSelectedAction(action);
    setEditInstructionArgs({});
    setEditValidationErrors({});
    setShowEditValidationErrors(false);

    let initialArgs: Record<string, string> = {};

    if (action === 'reuse_test') {
      setTestSearchQuery('');
      fetchSuiteTests();
      fetchSuiteSegments();
    }

    if (action === 'ai_file_upload') {
      fetchSuiteFiles();
    }

    if (action === 'verify') {
      setEditVerifyCurrentArgIndex(0);
      initialArgs = {
        fail_test: 'true',
        expected_result: 'true'
      };
    }

    if (action === 'ai_assert') {
      initialArgs = {
        fail_test: 'true',
        expected_result: 'true'
      };
    }

    if (action === 'switch_tab') {
      fetchLiveUrls();
      initialArgs.tabSelectionMethod = 'dropdown';
    }

    setEditInstructionArgs(initialArgs);

    if (actions[action]?.type === 'AI' || (action === 'verify' && editInstructionArgs.locator_type === 'ai')) {
      setEditAiUse('generate_script');
    }
  };

  const handleArgChange = (key: string, value: string) => {
    setInstructionArgs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleEditArgChange = (key: string, value: string) => {
    setEditInstructionArgs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleVerifyArgChange = (key: string, value: string) => {
    if (key === 'target') {
      setInstructionArgs(prev => {
        const newArgs = { ...prev, [key]: value };
        return clearVerifyFieldsOnTargetChange(newArgs, value);
      });
    } else if (key === 'property') {
      setInstructionArgs(prev => {
        const newArgs = { ...prev, [key]: value };
        delete (newArgs as any).check;
        delete (newArgs as any).value;
        return newArgs;
      });
    } else {
      setInstructionArgs(prev => ({
        ...prev,
        [key]: value
      }));
    }
    setValidationErrors(prev => ({
      ...prev,
      [key]: ''
    }));
  };

  const handleEditVerifyArgChange = (key: string, value: string) => {
    if (key === 'target') {
      setEditInstructionArgs(prev => {
        const newArgs = { ...prev, [key]: value };
        return clearVerifyFieldsOnTargetChange(newArgs, value);
      });
      setEditVerifyCurrentArgIndex(0);
    } else if (key === 'property') {
      setEditInstructionArgs(prev => {
        const newArgs = { ...prev, [key]: value };
        delete (newArgs as any).check;
        delete (newArgs as any).value;
        return newArgs;
      });
    } else {
      setEditInstructionArgs(prev => ({
        ...prev,
        [key]: value
      }));
    }
    setEditValidationErrors(prev => ({
      ...prev,
      [key]: ''
    }));
  };

  return {
    handleActionSelect,
    handleEditActionSelect,
    handleArgChange,
    handleEditArgChange,
    handleVerifyArgChange,
    handleEditVerifyArgChange,
    handleTestSearch,
    fetchSuiteTests,
    fetchSuiteSegments,
    fetchSuiteFiles,
    fetchLiveUrls,
    contextHolder,
  };
};
