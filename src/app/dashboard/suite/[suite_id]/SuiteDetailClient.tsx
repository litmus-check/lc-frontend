"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import JSONPretty from "react-json-pretty";
import {
  Alert,
  Button,
  Input,
  Spin,
  message,
  Table,
  Tabs,
  Tooltip,
  Modal,
  Radio,
  InputNumber,
  DatePicker,
  Select,
  Dropdown,
  Upload,
  Image,
  Skeleton,
  Tag,
  Checkbox,
} from "antd";
import Link from "next/link";
import NextImage from "next/image";
import DeleteConfirmation from "@/components/DeleteConfirmation/DeleteConfirmation";
import {
  ArrowLeftOutlined,
  XFilled,
  LeftOutlined,
  EditTwoTone,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "@/styles/globals.css";

const SegmentModal = dynamic(() => import("@/components/SegmentModal/SegmentModal"), { ssr: false, loading: () => null });
const CreateStoreModal = dynamic(
  () => import("@/components/CreateStoreModal/CreateStoreModal").then((mod) => ({ default: mod.CreateStoreModal })),
  { ssr: false, loading: () => null }
);

const Config = dynamic(() => import("@/components/Config/Config"), { ssr: false });
const TestFilters = dynamic(() => import("@/components/TestFilters/TestFilters"), { ssr: false });
const SendInviteModal = dynamic(() => import("@/components/SendInviteModal/SendInviteModal"), { ssr: false, loading: () => null });
import {
  getTestsAPI,
  runTestAPI,
  deleteTestAPI,
  getTestSuiteAPI,
  updateTestSuiteAPI,
  getTestRunsAPI,
  getTestRunsBulkAPI,
  getSuiteRunsAPI,
  getTestRunsForSuiteRunAPI,
  runSuiteAPI,
  getTestSuitesAPI,
  createTestAPI,
  getTestAPI,
  uploadFileAPI,
  getFilesAPI,
  getFileAPI,
  updateFileAPI,
  deleteFileAPI,
  downloadFileAPI,
  generateTestPlansAPI,
  bulkCreateTestsAPI,
  updateTestAPI,
  getTagsAPI,
} from "@/lib/apis/testAI/test";
import {
  createScheduleAPI,
  getSchedulesAPI,
  updateScheduleAPI,
  deleteScheduleAPI,
} from "@/lib/apis/testAI/schedules";
import {
  createEnvironmentAPI,
  getEnvironmentsBySuiteAPI,
  updateEnvironmentAPI,
  deleteEnvironmentAPI,
  Environment,
  CreateEnvironmentRequest,
  UpdateEnvironmentRequest,
} from "@/lib/apis/testAI/environments";
import {
  getEmailRecipientsAPI,
  createEmailRecipientsAPI,
  updateEmailRecipientsAPI,
  EmailRecipientsResponse,
} from "@/lib/apis/testAI/emailRecipients";
import {
  getElementsAPI,
  updateElementAPI,
  deleteElementAPI,
  mergeElementsAPI,
} from "@/lib/apis/testAI/element";
import { ElementResponse } from "@/types/element";
import { getStoresAPI, createStoreAPI } from "@/lib/apis/testAI/store";
import { Store } from "@/types/store";
import {
  getSegmentAPI,
  createSegmentAPI,
  getSegmentsBySuiteAPI,
  updateSegmentAPI,
  deleteSegmentAPI,
} from "@/lib/apis/testAI/segments";
import {
  CreateSegmentRequest,
  UpdateSegmentRequest,
  TestSegment,
} from "../../../../../types/segment";

import MaxWidthWrapper from "@/components/MaxWidthWrapper/MaxWidthWrapper";
import { ClockCircleOutlined, CalendarOutlined, InfoCircleOutlined, DownOutlined, PlusOutlined, EditOutlined, LinkOutlined, ExportOutlined, MailOutlined, MinusOutlined } from "@ant-design/icons";
import { extractErrorMessage, setStoredEnvironment, formatTimestamp } from "@/lib/utils";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useSuite } from "@/contexts/SuiteContext";
import { useNavigationLoading } from "@/contexts/NavigationLoadingContext";
import { useUser } from "@/contexts/UserContext";
import { RoleBasedButton } from "@/components/ui/role-based-button";
import { actions } from "@/lib/constants/actions";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
// Add type definitions
interface Schedule {
  id: string;
  type: "hourly" | "daily";
  interval: number;
  startTime: string;
}

// Define a single source of truth for tab keys
const TAB = {
  TESTS: 1,
  FILES: 2,
  DATA: 3,
  ENVIRONMENTS: 4,
  LOGS: 5,
  SCHEDULES: 6,
  SETTINGS: 7,
  PLAN: 8,
  SEGMENTS: 9,
  ELEMENTS: 10,
} as const;

interface SuiteDetailClientProps {
  initialSuiteData?: any;
  initialError?: string | null;
}

export default function SuiteDetailClient({
  initialSuiteData: initialSuiteDataProp,
  initialError: initialErrorProp,
}: SuiteDetailClientProps = {}) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { suite: contextSuite, suiteError: contextError, setSuite: setContextSuite } = useSuite();
  const setNavigationLoading = useNavigationLoading();
  const initialSuiteData = initialSuiteDataProp ?? contextSuite;
  const initialError = initialErrorProp ?? contextError;
  const onTestNavClick = () => setNavigationLoading?.(true);

  const [runTestLoading, setRunTestLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [testName, setTestName] = useState("");

  const [testsLoading, setTestsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("Create test");
  const { getToken } = useAuth();
  const [testSuite, setTestSuite] = useState<any>(initialSuiteData ?? null);
  const [deleteTestId, setDeleteTestId] = useState<string>("");
  const [editingTagTestId, setEditingTagTestId] = useState<string | null>(null);
  const [newTagValue, setNewTagValue] = useState<string>("");
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagModalTestId, setTagModalTestId] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>("");
  const [tagModalLoading, setTagModalLoading] = useState(false);
  const suite_id = params?.suite_id as string;
  const initialPaginationSyncedForSuiteRef = useRef<string | null>(null);
  const [runSuiteLoading, setRunSuiteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedSuiteRun, setSelectedSuiteRun] = useState<any>(null);

  const [suiteRuns, setSuiteRuns] = useState<any>(null);
  const [suiteRunsLoading, setSuiteRunsLoading] = useState(false);
  const [formFields, setFormFields] = useState({
    sign_in_url: "",
    username: "",
    password: "",
  });
  const [emptyStateUrl, setEmptyStateUrl] = useState("");
  const [emptyStateUrlError, setEmptyStateUrlError] = useState(false);
  const [currTab, setCurrTab] = useState<number>(() => {
    const tabParam = searchParams?.get('tab');
    return tabParam ? parseInt(tabParam) : 1;
  });

  const [schedules, setSchedules] = useState<any[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [isCreateScheduleModalOpen, setIsCreateScheduleModalOpen] =
    useState(false);
  const [isViewScheduleModalOpen, setIsViewScheduleModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [scheduleType, setScheduleType] = useState<"hourly" | "daily">(
    "hourly"
  );
  const [scheduleTime, setScheduleTime] = useState<any>(null);
  const [hourlyInterval, setHourlyInterval] = useState<number>(1);
  const [scheduleConfig, setScheduleConfig] = useState({
    browser: "chrome",
    device: "desktop",
    os: "windows",
    viewport: "1920x1080"
  });

  // Environment selection for schedule modal (independent of suite environment)
  const [scheduleEnvironmentId, setScheduleEnvironmentId] = useState<string>("no-environment");
  const [editScheduleConfig, setEditScheduleConfig] = useState({
    browser: "chrome",
    device: "desktop",
    os: "windows",
    viewport: "1920x1080"
  });
  const [scheduleConfigTab, setScheduleConfigTab] = useState<"schedule" | "config" | "tags">("schedule");
  const [editScheduleConfigTab, setEditScheduleConfigTab] = useState<"schedule" | "config" | "tags">("schedule");
  const [runConfigTab, setRunConfigTab] = useState<"config" | "tags">("config");
  const [masterTags, setMasterTags] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [selectedScheduleTags, setSelectedScheduleTags] = useState<string[]>([]);
  const [scheduleTagCondition, setScheduleTagCondition] = useState<"no_filter" | "contains_any" | "does_not_contain_any">("no_filter");
  const [selectedEditScheduleTags, setSelectedEditScheduleTags] = useState<string[]>([]);
  const [editScheduleTagCondition, setEditScheduleTagCondition] = useState<"no_filter" | "contains_any" | "does_not_contain_any">("no_filter");
  const [selectedRunTags, setSelectedRunTags] = useState<string[]>([]);
  const [runTagCondition, setRunTagCondition] = useState<"no_filter" | "contains_any" | "does_not_contain_any">("no_filter");
  const [runConfig, setRunConfig] = useState({
    browser: "chrome",
    device: "desktop",
    os: "windows",
    viewport: "1920x1080"
  });
  const [isRunConfigModalOpen, setIsRunConfigModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [testsPagination, setTestsPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });
  // Store applied filter values to use when pagination changes
  const [appliedSearchQuery, setAppliedSearchQuery] = useState<string | undefined>(undefined);
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<string | undefined>(undefined);
  const [appliedLastRunFilter, setAppliedLastRunFilter] = useState<string | undefined>(undefined);
  const [suiteRunsPagination, setSuiteRunsPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} items`,
  });
  const [schedulesPagination, setSchedulesPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [suiteRunsData, setSuiteRunsData] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteScheduleModalOpen, setIsDeleteScheduleModalOpen] =
    useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<any>(null);
  const [settings, setSettings] = useState({
    browser: "chrome",
    device: "desktop",
    os: "windows",
    viewport: "1920x1080",
    onTestFailure: "triage_only"
  });

  // Email recipients state
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
  const [emailRecipientsLoading, setEmailRecipientsLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

  // Elements state
  const [elements, setElements] = useState<ElementResponse[]>([]);
  const [elementsLoading, setElementsLoading] = useState(false);
  const [showSelectorsModal, setShowSelectorsModal] = useState(false);
  const [selectedElementSelectors, setSelectedElementSelectors] = useState<any[]>([]);
  const [selectedSelectorIndex, setSelectedSelectorIndex] = useState<number>(0);
  const [updateSelectorLoading, setUpdateSelectorLoading] = useState(false);
  const [selectedElementForEdit, setSelectedElementForEdit] = useState<ElementResponse | null>(null);
  const [showEditElementModal, setShowEditElementModal] = useState(false);
  const [deleteElementId, setDeleteElementId] = useState<string>("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [updateElementLoading, setUpdateElementLoading] = useState(false);

  // Stores state
  const [stores, setStores] = useState<any[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);
  const [createStoreLoading, setCreateStoreLoading] = useState(false);

  // Merge elements state
  const [isMergeMode, setIsMergeMode] = useState(false);
  const [primaryElementId, setPrimaryElementId] = useState<string>("");
  const [selectedElementsForMerge, setSelectedElementsForMerge] = useState<string[]>([]);
  const [mergeLoading, setMergeLoading] = useState(false);

  // Initialize settings with defaults
  useEffect(() => {
    if (!testSuite) {
      setSettings({
        browser: "chrome",
        device: "desktop",
        os: "windows",
        viewport: "1920x1080",
        onTestFailure: "triage_only"
      });
    }
  }, [testSuite]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [selectedTestToDuplicate, setSelectedTestToDuplicate] = useState<any>(null);
  const [availableSuites, setAvailableSuites] = useState<any[]>([]);
  const [selectedTargetSuite, setSelectedTargetSuite] = useState<string>("");
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [targetSuiteType, setTargetSuiteType] = useState<"current" | "other">("current");
  const [fetchingSuites, setFetchingSuites] = useState(false);
  const [editSuiteName, setEditSuiteName] = useState<boolean>(false);
  const [suiteName, setSuiteName] = useState<string>("");
  const [editSuiteDescription, setEditSuiteDescription] = useState<boolean>(false);
  const [suiteDescription, setSuiteDescription] = useState<string>("");

  // Plan tab state
  const [planDescription, setPlanDescription] = useState<string>("");
  const [generatedTests, setGeneratedTests] = useState<any[]>([]);
  const [planLoading, setPlanLoading] = useState<boolean>(false);
  const [bulkCreateLoading, setBulkCreateLoading] = useState<boolean>(false);
  const [discardedTests, setDiscardedTests] = useState<Set<number>>(new Set());

  // File management state
  const [files, setFiles] = useState<any[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isViewFileModalOpen, setIsViewFileModalOpen] = useState(false);
  const [isDeleteFileModalOpen, setIsDeleteFileModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<any>(null);
  const [isUpdateFileModalOpen, setIsUpdateFileModalOpen] = useState(false);
  const [fileToUpdate, setFileToUpdate] = useState<any>(null);
  const [updateFileLoading, setUpdateFileLoading] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  // Data management state
  const [dataFiles, setDataFiles] = useState<any[]>([]);
  const [dataFilesLoading, setDataFilesLoading] = useState(false);
  const [dataUploadLoading, setDataUploadLoading] = useState(false);
  const [selectedDataFile, setSelectedDataFile] = useState<any>(null);
  const [isViewDataFileModalOpen, setIsViewDataFileModalOpen] = useState(false);
  const [isDeleteDataFileModalOpen, setIsDeleteDataFileModalOpen] = useState(false);
  const [dataFileToDelete, setDataFileToDelete] = useState<any>(null);
  const [isUpdateDataFileModalOpen, setIsUpdateDataFileModalOpen] = useState(false);
  const [dataFileToUpdate, setDataFileToUpdate] = useState<any>(null);
  const [updateDataFileLoading, setUpdateDataFileLoading] = useState(false);

  // Segments state
  const [segments, setSegments] = useState<TestSegment[]>([]);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [isCreateSegmentModalOpen, setIsCreateSegmentModalOpen] = useState(false);
  const [isUpdateSegmentModalOpen, setIsUpdateSegmentModalOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<TestSegment | null>(null);
  const [segmentLoading, setSegmentLoading] = useState(false);
  const [isDeleteSegmentModalOpen, setIsDeleteSegmentModalOpen] = useState(false);
  const [segmentToDelete, setSegmentToDelete] = useState<TestSegment | null>(null);

  const { selectedEnvironment, setSelectedEnvironment, environments, environmentsLoading, triggerRefresh } = useEnvironment();
  const { currentUserDetails } = useUser();

  useEffect(() => {
    if (testSuite) {
      document.title = `${testSuite?.name} suite - Litmus Check`;
    }
  }, [testSuite]);

  useEffect(() => {
    if (testSuite) {
      //  console.log("TestSuite data:", testSuite); // Debug log
      setFormFields({
        sign_in_url: testSuite.sign_in_url || "",
        username: testSuite.username || "",
        password: testSuite.password || "",
      });

      // Populate emptyStateUrl from testSuite.sign_in_url
      if (testSuite?.sign_in_url) {
        setEmptyStateUrl(testSuite?.sign_in_url);
      }

      // Load config settings if they exist
      if (testSuite.config) {
        const config = testSuite.config;
        // console.log("Loading config from API:", config); // Debug log

        const viewport = config.viewport ? `${config.viewport.width}x${config.viewport.height}` : "1920x1080";
        const deviceType = config.device?.type || "desktop";
        const os = config.device?.device_config?.os || (deviceType === "desktop" ? "windows" : "android");

        // Determine onTestFailure value from heal_test and triage
        let onTestFailure = "triage_only";
        if (testSuite.heal_test === true && testSuite.triage === true) {
          onTestFailure = "offer_heal_suggestions";
        } else if (testSuite.heal_test === false && testSuite.triage === true) {
          onTestFailure = "triage_only";
        } else {
          onTestFailure = "triage_only";
        }

        setSettings({
          browser: config.browser || "chrome",
          device: deviceType,
          os: os,
          viewport: viewport,
          onTestFailure: onTestFailure
        });
      } else {
        // If no config exists, set default values
        // console.log("No config found, using defaults");
        setSettings({
          browser: "chrome",
          device: "desktop",
          os: "windows",
          viewport: "1920x1080",
          onTestFailure: "triage_only"
        });
      }
    }
  }, [testSuite]);

  // Sync testSuite when layout provides suite data via context (after fetch completes).
  // Sync pagination from metadata only once per suite load so we don't overwrite the user's page
  // size when context updates after a client fetch (setContextSuite), which would cause 50/100 flip.
  useEffect(() => {
    if (initialSuiteData == null) return;
    setTestSuite(initialSuiteData);
    if (!initialSuiteData.metadata) return;
    if (initialPaginationSyncedForSuiteRef.current === suite_id) return;
    initialPaginationSyncedForSuiteRef.current = suite_id;
    const meta = initialSuiteData.metadata;
    setTestsPagination((prev) => ({
      current: meta.page_number ?? prev.current,
      pageSize: meta.page_size ?? prev.pageSize,
      total: meta.total_records ?? prev.total,
    }));
  }, [initialSuiteData, suite_id]);

  useEffect(() => {
    if (testSuite) {
      setSuiteName(testSuite.name || "");
      setSuiteDescription(testSuite.description || "");
    }
  }, [testSuite]);

  // Always fetch tests when landing on suite page or when pagination/filters change (fresh data on every visit)
  useEffect(() => {
    if (currTab === TAB.TESTS) {
      getTestSuite(
        testsPagination.current,
        testsPagination.pageSize,
        appliedSearchQuery,
        appliedStatusFilter,
        appliedLastRunFilter
      );
    }
  }, [currTab, testsPagination.current, testsPagination.pageSize, appliedSearchQuery, appliedStatusFilter, appliedLastRunFilter]);

  useEffect(() => {
    if (currTab === TAB.LOGS) {
      getSuiteRuns();
    }
  }, [suiteRunsPagination.current, suiteRunsPagination.pageSize, currTab]);

  useEffect(() => {
    // Update current time every second
    const interval = setInterval(() => {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, "0");
      const day = String(now.getUTCDate()).padStart(2, "0");
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const minutes = String(now.getUTCMinutes()).padStart(2, "0");
      const gmtTime = `${year}-${month}-${day} ${hours}:${minutes} GMT`;
      setCurrentTime(gmtTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for environment creation/update events from new tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === 'environmentCreated' || e.key === 'environmentUpdated') && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.suiteId === suite_id) {
            // Refresh environments when new one is created or updated
            triggerRefresh();
            // Clear the notification
            localStorage.removeItem(e.key);
          }
        } catch (error) {
          console.error('Error parsing environment notification:', error);
        }
      }
    };

    // Listen for storage events (from other tabs)
    window.addEventListener('storage', handleStorageChange);

    // Also check for existing notifications on component mount
    const existingCreatedNotification = localStorage.getItem('environmentCreated');
    const existingUpdatedNotification = localStorage.getItem('environmentUpdated');

    if (existingCreatedNotification) {
      try {
        const data = JSON.parse(existingCreatedNotification);
        if (data.suiteId === suite_id) {
          triggerRefresh();
          localStorage.removeItem('environmentCreated');
        }
      } catch (error) {
        console.error('Error parsing existing environment creation notification:', error);
      }
    }

    if (existingUpdatedNotification) {
      try {
        const data = JSON.parse(existingUpdatedNotification);
        if (data.suiteId === suite_id) {
          triggerRefresh();
          localStorage.removeItem('environmentUpdated');
        }
      } catch (error) {
        console.error('Error parsing existing environment update notification:', error);
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [suite_id, triggerRefresh]);

  const handleRunTest = useCallback(async (record: any) => {
    setRunTestLoading(record.test.id);
    const token = await getToken({ template: "basic" });
    if (!token) {
      messageApi.error("Authentication required");
      return;
    }

    try {
      const response = await runTestAPI(token, record.test.id, undefined, undefined, selectedEnvironment?.environment_id || null);
      if (response.status === 200) {
        setRunTestLoading(false);
        messageApi.success(response?.data?.message);
      } else {
        setRunTestLoading(false);
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error) {
      setRunTestLoading(false);
      messageApi.error(extractErrorMessage(error));
    }
  }, [selectedEnvironment, getToken, messageApi]);

  const getTestSuite = async (page?: number, limit?: number, query?: string, status?: string, last_run?: string | null) => {
    setTestsLoading(true);
    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
    }

    try {
      // Convert "null" string to actual null for the API call
      const lastRunParam = last_run === "null" ? null : last_run;
      const response = await getTestSuiteAPI(token, suite_id, page, limit, query, status, lastRunParam);
      if (response.status === 200) {
        setTestSuite(response.data);
        // Only update context with unfiltered data so navigating back from test page shows all tests
        if (!query && !status && last_run === undefined) {
          setContextSuite(response.data);
        }
        // Update pagination with metadata from response only if values have changed
        // Preserve pageSize from state (user preference) and only update current and total
        if (response.data.metadata) {
          setTestsPagination((prev) => {
            const newPageNumber = response.data.metadata.page_number;
            const newTotal = response.data.metadata.total_records;
            
            // Only update if values have actually changed to prevent infinite loops
            // Keep the existing pageSize (user preference) instead of using API response
            if (
              prev.current !== newPageNumber ||
              prev.total !== newTotal
            ) {
              return {
                current: newPageNumber,
                pageSize: prev.pageSize, // Preserve user's page size preference
                total: newTotal,
              };
            }
            return prev;
          });
        }
        setTestsLoading(false);
      } else {
        messageApi.error(extractErrorMessage(response));
        setTestsLoading(false);
      }
    } catch (error: any) {
      //   setIsWorkFlowLoading(false);
      messageApi.error(extractErrorMessage(error));
      setTestsLoading(false);
      // setError(true);
    }
  };

  // Handler for Apply button - calls API with current filter values
  const handleApplyFilters = (query: string, status: string | undefined, lastRun: string | undefined) => {
    // Store applied filter values
    setAppliedSearchQuery(query || undefined);
    setAppliedStatusFilter(status);
    setAppliedLastRunFilter(lastRun);
    const newPagination = { ...testsPagination, current: 1 };
    setTestsPagination(newPagination);
    getTestSuite(
      1,
      newPagination.pageSize,
      query || undefined,
      status,
      lastRun
    );
  };

  // Handler for Clear button - clears all filters and calls API with no params
  const handleClearFilters = () => {
    // Clear applied filter values
    setAppliedSearchQuery(undefined);
    setAppliedStatusFilter(undefined);
    setAppliedLastRunFilter(undefined);
    setTestsPagination({ ...testsPagination, current: 1 });
    getTestSuite(
      1,
      testsPagination.pageSize,
      undefined,
      undefined,
      undefined
    );
  };

  const handleAddTag = useCallback(async (testId: string, tagValue: string) => {
    if (!tagValue.trim()) {
      return;
    }

    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
      return;
    }

    try {
      // Find the current test to get existing tags
      const currentTest = testSuite?.tests?.find((t: any) => t.id === testId);
      if (!currentTest) {
        messageApi.error("Test not found");
        return;
      }

      const existingTags = currentTest?.tags || [];

      // Check if tag already exists
      if (existingTags.includes(tagValue.trim())) {
        messageApi.warning("Tag already exists");
        setEditingTagTestId(null);
        setNewTagValue("");
        return;
      }

      // Add new tag to the array
      const updatedTags = [...existingTags, tagValue.trim()];

      // Prepare payload with all test fields, excluding read-only fields
      // and handling special fields that might need formatting
      const {
        id,
        created_at,
        modified_at,
        last_run,
        last_run_status,
        last_run_mode,
        playwright_instructions,
        ...testFields
      } = currentTest;

      // Build payload with all test fields and updated tags
      const payload: any = {
        ...testFields,
        tags: updatedTags,
      };

      // Handle playwright_instructions if it exists and is a string (needs to be parsed)
      if (playwright_instructions) {
        if (typeof playwright_instructions === 'string') {
          try {
            payload.playwright_instructions = JSON.parse(playwright_instructions);
          } catch (e) {
            // If parsing fails, exclude it or set to empty object
            console.warn('Failed to parse playwright_instructions:', e);
          }
        } else {
          payload.playwright_instructions = playwright_instructions;
        }
      }

      const response = await updateTestAPI(token, testId, payload);

      if (response.status === 200) {
        // Refresh the test suite to get updated data
        getTestSuite();
        messageApi.success("Tag added successfully");
        setEditingTagTestId(null);
        setNewTagValue("");
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error) {
      messageApi.error(extractErrorMessage(error));
    }
  }, [testSuite, getToken, messageApi, router]);

  const handleRemoveTag = useCallback(async (testId: string, tagToRemove: string) => {
    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
      return;
    }

    try {
      // Find the current test to get existing tags
      const currentTest = testSuite?.tests?.find((t: any) => t.id === testId);
      if (!currentTest) {
        messageApi.error("Test not found");
        return;
      }

      const existingTags = currentTest?.tags || [];

      // Remove the tag from the array
      const updatedTags = existingTags.filter((tag: string) => tag !== tagToRemove);

      // Prepare payload with all test fields, excluding read-only fields
      // and handling special fields that might need formatting
      const {
        id,
        created_at,
        modified_at,
        last_run,
        last_run_status,
        last_run_mode,
        playwright_instructions,
        ...testFields
      } = currentTest;

      // Build payload with all test fields and updated tags
      const payload: any = {
        ...testFields,
        tags: updatedTags,
      };

      // Handle playwright_instructions if it exists and is a string (needs to be parsed)
      if (playwright_instructions) {
        if (typeof playwright_instructions === 'string') {
          try {
            payload.playwright_instructions = JSON.parse(playwright_instructions);
          } catch (e) {
            // If parsing fails, exclude it or set to empty object
            console.warn('Failed to parse playwright_instructions:', e);
          }
        } else {
          payload.playwright_instructions = playwright_instructions;
        }
      }

      const response = await updateTestAPI(token, testId, payload);

      if (response.status === 200) {
        // Refresh the test suite to get updated data
        getTestSuite();
        messageApi.success("Tag removed successfully");
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error) {
      messageApi.error(extractErrorMessage(error));
    }
  }, [testSuite, getToken, messageApi, router]);

  const fetchMasterTags = useCallback(async () => {
    const token = await getToken({ template: "basic" });
    if (token === null) {
      return;
    }

    try {
      setTagsLoading(true);
      const response = await getTagsAPI(token, suite_id);
      if (response.status === 200 && response.data?.master_tags) {
        setMasterTags(response.data.master_tags);
      }
    } catch (error) {
      console.error("Error fetching master tags:", error);
      messageApi.error("Failed to fetch tags");
    } finally {
      setTagsLoading(false);
    }
  }, [suite_id, getToken, messageApi]);

  // Fetch tags when Tags tab is accessed
  useEffect(() => {
    if (scheduleConfigTab === "tags" || editScheduleConfigTab === "tags" || runConfigTab === "tags") {
      fetchMasterTags();
    }
  }, [scheduleConfigTab, editScheduleConfigTab, runConfigTab, fetchMasterTags]);

  // Fetch tags for tag modal
  const fetchTagsForModal = useCallback(async () => {
    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
      return;
    }

    try {
      setTagModalLoading(true);
      const response = await getTagsAPI(token, suite_id);
      if (response.status === 200 && response.data?.master_tags) {
        setAvailableTags(response.data.master_tags);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      messageApi.error("Failed to fetch tags");
    } finally {
      setTagModalLoading(false);
    }
  }, [suite_id, getToken, messageApi, router]);

  // Handle opening tag modal
  const handleOpenTagModal = useCallback((testId: string) => {
    const currentTest = testSuite?.tests?.find((t: any) => t.id === testId);
    const existingTags = currentTest?.tags || [];
    setTagModalTestId(testId);
    setSelectedTags(existingTags);
    setNewTagInput("");
    setIsTagModalOpen(true);
    fetchTagsForModal();
  }, [testSuite, fetchTagsForModal]);

  // Handle saving selected tags
  const handleSaveTags = useCallback(async () => {
    if (!tagModalTestId) {
      return;
    }

    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
      return;
    }

    try {
      // Find the current test
      const currentTest = testSuite?.tests?.find((t: any) => t.id === tagModalTestId);
      if (!currentTest) {
        messageApi.error("Test not found");
        return;
      }

      // Prepare payload with all test fields, excluding read-only fields
      const {
        id,
        created_at,
        modified_at,
        last_run,
        last_run_status,
        last_run_mode,
        playwright_instructions,
        ...testFields
      } = currentTest;

      // Build payload with selected tags
      const payload: any = {
        ...testFields,
        tags: selectedTags,
      };

      // Handle playwright_instructions if it exists and is a string (needs to be parsed)
      if (playwright_instructions) {
        if (typeof playwright_instructions === 'string') {
          try {
            payload.playwright_instructions = JSON.parse(playwright_instructions);
          } catch (e) {
            console.warn('Failed to parse playwright_instructions:', e);
          }
        } else {
          payload.playwright_instructions = playwright_instructions;
        }
      }

      const response = await updateTestAPI(token, tagModalTestId, payload);

      if (response.status === 200) {
        // Refresh the test suite to get updated data
        getTestSuite();
        messageApi.success("Tags updated successfully");
        setIsTagModalOpen(false);
        setTagModalTestId(null);
        setSelectedTags([]);
        setNewTagInput("");
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error) {
      messageApi.error(extractErrorMessage(error));
    }
  }, [tagModalTestId, selectedTags, testSuite, getToken, messageApi, router]);

  // Handle adding new tag in modal
  const handleAddNewTagInModal = useCallback(() => {
    if (!newTagInput.trim()) {
      return;
    }

    const trimmedTag = newTagInput.trim();

    // Check if tag already exists in available tags
    if (!availableTags.includes(trimmedTag)) {
      setAvailableTags([...availableTags, trimmedTag]);
    }

    // Check if tag is already selected
    if (!selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
    }

    setNewTagInput("");
  }, [newTagInput, availableTags, selectedTags]);

  // Reactive columns that update when environment changes
  const columns = useMemo(() => [
    {
      title: "Test ID",
      dataIndex: "custom_test_id",
      render: (text: any, record: any) => (
        record.test.custom_test_id ? (
          <Link
            href={`/dashboard/suite/${suite_id}/test/${record.test.id}`}
            className="font-hanken hover:!text-[#4542CC] text-[#4542CC]"
            onClick={onTestNavClick}
          >
            {record.test.custom_test_id}
          </Link>
        ) : (
          <p className="font-hanken text-[#4542CC]">-</p>
        )
      ),
    },
    {
      title: "Test",
      dataIndex: "name",
      render: (text: any, record: any) => (
        <Link
          href={`/dashboard/suite/${suite_id}/test/${record.test.id}`}
          className="font-hanken hover:!text-[#4542CC] text-[#4542CC]"
          data-testid={`test-link-${record.name}`}
          onClick={onTestNavClick}
        >
          {record.name}
        </Link>
      ),
    },
    {
      title: "Last Run",
      dataIndex: "last_run",
      render: (text: any, record: any) => (
        <Tooltip
          placement="topLeft"
          title={
            <>
              Status: {record?.test.last_run_status ?? "N/A"}
              <br />
              At: {record?.test.last_run ?? "N/A"}
              <br />
              Mode: {record?.test.last_run_mode ?? "N/A"}
            </>
          }
        >
          <p className="font-hanken">
            {record?.test.last_run_status === "success" ||
              record?.test.last_run_status === "success-flaky" ||
              record?.test.last_run_status === "success-healed" ? (
              <XFilled className="text-[#20AD4C] w-[16px] h-[16px]" />
            ) : record?.test.last_run_status === "failed" ||
              record?.test.last_run_status === "error" ? (
              <XFilled className="text-[#EA3962] w-[16px] h-[16px]" />
            ) : record?.test.last_run_status === "running" ? (
              <XFilled className="text-[#FFB231] w-[16px] h-[16px]" />
            ) : (
              <XFilled className="text-[#D9D9D9] w-[16px] h-[16px]" />
            )}
          </p>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: any, record: any) => (
        <p className="font-hanken">{record?.status ?? "ready"}</p>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      width: 200,
      render: (text: any, record: any) => {
        const tags = record?.test?.tags || [];
        const isEditing = editingTagTestId === record.test.id;
        const maxVisibleTags = 3;
        const visibleTags = tags.slice(0, maxVisibleTags);
        const remainingTags = tags.slice(maxVisibleTags);

        return (
          <div className="flex flex-wrap gap-2 items-center max-w-[200px]">
            {visibleTags.map((tag: string, index: number) => (
              <Tag
                key={index}
                className="font-hanken flex items-center gap-1"
                closable
                onClose={(e) => {
                  e.preventDefault();
                  handleRemoveTag(record.test.id, tag);
                }}
              >
                {tag}
              </Tag>
            ))}
            {remainingTags.length > 0 && (
              <Tooltip title={
                <div>
                  {remainingTags.map((tag: string, index: number) => (
                    <Tag key={index} className="font-hanken m-1">
                      {tag}
                    </Tag>
                  ))}
                </div>
              }>
                <span className="font-hanken text-[#AE00FF] cursor-pointer">...</span>
              </Tooltip>
            )}
            <Tooltip title="Add tag">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                className="font-hanken text-[#AE00FF] hover:!text-[#AE00FF] border-none shadow-none"
                onClick={() => {
                  handleOpenTagModal(record.test.id);
                }}
              />
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Instructions",
      dataIndex: "instructions",
      render: (text: any, record: any) => (
        <p className="font-hanken">{record?.instructions?.length}</p>
      ),
    },
    {
      title: "Action",
      dataIndex: "test",
      render: (text: any, record: any) => (
        <div className="flex gap-5" data-testid={`test-actions-${record.name}`}>
          <Link
            className="font-hanken"
            href={`/dashboard/suite/${suite_id}/test/${record.test.id}`}
            onClick={onTestNavClick}
          >
            <Button
              type="text"
              className="font-hanken border-none text-[#AE00FF] hover:!text-[#AE00FF] w-[50px] shadow-none"
              size="small"
              data-testid={`test-view-button-${record.name}`}
            >
              View
            </Button>
          </Link>
          <Button
            type="text"
            className="font-hanken ml-5 border-none w-[50px] shadow-none text-[#AE00FF] hover:!text-[#AE00FF]"
            loading={runTestLoading && runTestLoading === record.test.id}
            size="small"
            onClick={() => handleRunTest(record)}
            data-testid={`test-run-button-${record.name}`}
          >
            Run
          </Button>
          <RoleBasedButton
            type="text"
            className="font-hanken ml-5 border-none shadow-none !text-[#AE00FF]"
            size="small"
            onClick={() => handleDuplicate(record)}
            data-testid={`test-duplicate-button-${record.name}`}
          >
            Duplicate
          </RoleBasedButton>
          <RoleBasedButton
            type="text"
            className="font-hanken ml-5 border-none shadow-none !text-[#EA3962]"
            size="small"
            onClick={() => handleDelete(record)}
            data-testid={`test-delete-button-${record.name}`}
          >
            Delete
          </RoleBasedButton>
        </div>
      ),
    },
  ], [suite_id, runTestLoading, handleRunTest, handleOpenTagModal]);


  const deleteTest = async (testId: string) => {
    setDeleteLoading(true);
    const token = await getToken({ template: "basic" });
    if (token === null) {
      router.push("/sign-in");
    }

    try {
      const response = await deleteTestAPI(token, testId); // Assuming runTestAPI returns JSON data
      if (response.status === 200) {
        setDeleteLoading(false);
        setOpenModal(false);
        getTestSuite();
        messageApi.success(response?.data?.message);
      } else {
        setDeleteLoading(false);
        setOpenModal(false);
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error) {
      setDeleteLoading(false);
      messageApi.error(extractErrorMessage(error));
    }
  };

  const handleDelete = (record: any) => {
    setTestName(record.name);
    setModalTitle("Delete Confirmation");
    setDeleteTestId(record.test.id);
    setOpenModal(true);
  };

  const handleDuplicate = (record: any) => {
    setSelectedTestToDuplicate(record);
    setIsDuplicateModalOpen(true);
  };

  const fetchAvailableSuites = async () => {
    try {
      setFetchingSuites(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await getTestSuitesAPI(token, 1, 10000);
      if (response.status === 200) {
        if (response.data && response.data.items && Array.isArray(response.data.items)) {
          const filteredSuites = response.data.items.filter((suite: any) => suite.suite_id !== suite_id);
          setAvailableSuites(filteredSuites);
        } else {
          console.error('Unexpected API response structure:', response.data);
          messageApi.error("Invalid response format from server");
        }
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      console.error('Error fetching suites:', error);
      messageApi.error(extractErrorMessage(error));
    } finally {
      setFetchingSuites(false);
    }
  };

  useEffect(() => {
    if (isDuplicateModalOpen) {
      fetchAvailableSuites();
    }
  }, [isDuplicateModalOpen]);

  // Fetch segments when segments tab is selected
  useEffect(() => {
    if (currTab === TAB.SEGMENTS) {
      fetchSegments();
    }
  }, [currTab]);

  // Note: Test loading is now handled by TestSelect component

  // Note: Instruction pre-selection is now handled by SegmentModal component

  const handleDuplicateSubmit = async () => {
    if (targetSuiteType === "other" && !selectedTargetSuite) {
      messageApi.error("Please select a target suite");
      return;
    }

    // Navigate to the test compose page with the duplicate_from parameter
    const targetSuiteId = targetSuiteType === "current" ? suite_id : selectedTargetSuite;
    const queryParams = new URLSearchParams({
      duplicate_from: selectedTestToDuplicate.test.id
    }).toString();

    router.push(`/dashboard/suite/${targetSuiteId}/test/new/compose?${queryParams}`);

    // Close the modal
    setIsDuplicateModalOpen(false);
    setSelectedTestToDuplicate(null);
    setSelectedTargetSuite("");
    setTargetSuiteType("current");
  };


  const data = testSuite?.tests?.map((test: any, i: number) => {
    return {
      key: test?.id ?? test?.test_id ?? `test-row-${i}`,
      name: test?.name,
      status: test?.status,
      instructions: test?.instructions,
      test: test,
    };
  }) || [];

  const handleStartTestingFromEmptyState = () => {
    if (!emptyStateUrl.trim()) {
      setEmptyStateUrlError(true);
      return;
    }
    // URL validation regex
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlPattern.test(emptyStateUrl)) {
      setEmptyStateUrlError(true);
      return;
    }
    setEmptyStateUrlError(false);
    setNavigationLoading?.(true);
    // Navigate to compose page with URL parameter
    const encodedUrl = encodeURIComponent(emptyStateUrl);
    router.push(`/dashboard/suite/${suite_id}/test/new/compose?url=${encodedUrl}`);
  };

  const getSuiteRuns = async () => {
    setSuiteRunsLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) {
      messageApi.error("Authentication required");
      return;
    }

    try {
      const response = await getSuiteRunsAPI(token, suiteRunsPagination.current, suiteRunsPagination.pageSize, suite_id);
      if (response.status === 200) {
        setSuiteRuns(response.data);
        // Update pagination with total count from metadata
        const metadata = response.data?.metadata;
        if (metadata) {
          setSuiteRunsPagination((prev) => ({
            ...prev,
            total: metadata.total_records,
          }));
        }
        setSuiteRunsLoading(false);
      } else {
        messageApi.error(extractErrorMessage(response));
        setSuiteRunsLoading(false);
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
      setSuiteRunsLoading(false);
    }
  };

  const onSuiteRunClick = (record: any) => {
    // Open SuiteRunLogs component in a new page
    window.open(`/dashboard/suite/${suite_id}/run/${record.key}`, '_blank');
  };

  const suiteRunColumns = [
    {
      title: "Suite Run ID",
      dataIndex: "key",
      key: "key",
      render: (text: string) => (
        <p className="font-hanken text-[14px]">{text}</p>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => (
        <p className="font-hanken text-[14px]">{text}</p>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: 200,
      render: (text: any, record: any) => {
        const tags = record?.tags || [];
        const tagFilter = record?.tag_filter;
        const condition = tagFilter?.condition;
        const maxVisibleTags = 3;
        const visibleTags = tags.slice(0, maxVisibleTags);
        const remainingTags = tags.slice(maxVisibleTags);

        return (
          <div className="flex flex-wrap gap-2 items-center max-w-[200px]">
            {condition && (
              <Tooltip title={condition === 'contains_any' ? 'Contains Any' : 'Does Not Contain Any'}>
                {condition === 'contains_any' ? (
                  <PlusOutlined className="text-[#20AD4C] text-[14px]" />
                ) : (
                  <MinusOutlined className="text-[#EA3962] text-[14px]" />
                )}
              </Tooltip>
            )}
            {tags.length > 0 ? (
              <>
                {visibleTags.map((tag: string, index: number) => (
                  <Tag key={index} className="font-hanken">
                    {tag}
                  </Tag>
                ))}
                {remainingTags.length > 0 && (
                  <Tooltip title={
                    <div>
                      {remainingTags.map((tag: string, index: number) => (
                        <Tag key={index} className="font-hanken m-1">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  }>
                    <span className="font-hanken text-[#AE00FF] cursor-pointer">...</span>
                  </Tooltip>
                )}
              </>
            ) : (
              <span className="font-hanken text-[14px] text-gray-400">-</span>
            )}
          </div>
        );
      },
    },
    {
      title: "Result",
      dataIndex: "result",
      key: "result",
      render: (text: string, record: any) => (
        <div className="flex gap-2 font-hanken text-[14px]">
          <Tooltip title="Success Count">
            <span className="text-green-600">{record.success_count || 0}</span>
          </Tooltip>
          <span className="text-gray-400">|</span>
          <Tooltip title="Failure Count">
            <span className="text-red-600">{record.failure_count || 0}</span>
          </Tooltip>
          <span className="text-gray-400">|</span>
          <Tooltip title="Error Count">
            <span className="text-gray-500">{record.error_count || 0}</span>
          </Tooltip>
        </div>
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

  const suiteRunData = suiteRuns?.suite_runs?.map((suiteRun: any) => {
    // Calculate duration in seconds
    const calculateDuration = () => {
      if (!suiteRun?.start_date) return '-';
      if (!suiteRun?.end_date) return '-';

      const startDate = new Date(suiteRun.start_date);
      const endDate = new Date(suiteRun.end_date);
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationSeconds = durationMs / 1000;

      return durationSeconds.toFixed(1);
    };

    return {
      key: suiteRun?.suite_run_id,
      status: suiteRun?.status,
      tags: suiteRun?.tag_filter?.tags || [],
      tag_filter: suiteRun?.tag_filter || null,
      success_count: suiteRun?.success_count,
      failure_count: suiteRun?.failure_count,
      error_count: suiteRun?.error_count,
      timeStamp: formatTimestamp(suiteRun?.start_date),
      duration: calculateDuration(),
    };
  });



  const onRowClick = (record: any) => ({
    onClick: () => onSuiteRunClick(record),
    className:
      selectedSuiteRun?.runId === record?.key
        ? `custom-table bg-[#FFF2DB]`
        : `custom-table`,
  });

  const handleTabChange = (key: number) => {
    setCurrTab(key);
  };

  const handleCreateSchedule = () => {
    setScheduleType("hourly");
    setScheduleTime(null);
    setHourlyInterval(1);
    setScheduleConfigTab("schedule");
    // Reset schedule config to defaults
    setScheduleConfig({
      browser: "chrome",
      device: "desktop",
      os: "windows",
      viewport: "1920x1080"
    });
    setScheduleEnvironmentId("no-environment"); // Reset environment selection
    // Ensure environments are loaded
    if (environments.length === 0 && !environmentsLoading) {

      triggerRefresh();
    }
    setIsCreateScheduleModalOpen(true);
  };

  const handleViewSchedule = (record: any) => {
    console.log(record, "record");
    setSelectedSchedule(record);
    setScheduleType(record.type);
    setHourlyInterval(record.interval);

    if (record.type === "daily") {
      // Parse startTime as UTC
      setScheduleTime(dayjs.utc(record.startTime));
    } else {
      // For hourly schedules, use current UTC time
      setScheduleTime(dayjs.utc());
    }

    // Load config if it exists
    if (record.config) {
      const config = record.config;
      const viewport = config.viewport ? `${config.viewport.width}x${config.viewport.height}` : "1920x1080";
      const deviceType = config.device?.type || "desktop";
      const os = config.device?.device_config?.os || (deviceType === "desktop" ? "windows" : "android");

      setEditScheduleConfig({
        browser: config.browser || "chrome",
        device: deviceType,
        os: os,
        viewport: viewport
      });
    } else {
      // Reset to defaults if no config
      setEditScheduleConfig({
        browser: "chrome",
        device: "desktop",
        os: "windows",
        viewport: "1920x1080"
      });
    }

    // Always start with schedule tab
    setEditScheduleConfigTab("schedule");

    // Set environment from schedule data if available
    // Use environment_id directly since that's what we get from the API
    setScheduleEnvironmentId(record.environment_id || "no-environment");

    // Load tags if they exist
    if (record.tag_filter && record.tag_filter.tags && record.tag_filter.tags.length > 0) {
      setSelectedEditScheduleTags(record.tag_filter.tags);
      setEditScheduleTagCondition(record.tag_filter.condition || "contains_any");
    } else {
      setSelectedEditScheduleTags([]);
      setEditScheduleTagCondition("no_filter");
    }

    // Ensure environments are loaded
    if (environments.length === 0 && !environmentsLoading) {
      triggerRefresh();
    }

    setIsViewScheduleModalOpen(true);
  };

  const fetchSchedules = async () => {
    try {
      setSchedulesLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await getSchedulesAPI(token, suite_id);
      if (response.status === 200) {
        // Transform the API response to match the table data structure
        const formattedSchedules = response.data.schedules.map(
          (schedule: any) => {

            // Handle environment data - check both environment_name and environment_id
            let environmentName = "No environment";
            let environment = null;

            if (schedule.environment_name) {
              environmentName = schedule.environment_name;
              environment = environments.find(env => env.environment_name === schedule.environment_name);
            } else if (schedule.environment_id) {
              // Fallback to environment_id if environment_name is not available
              environment = environments.find(env => env.environment_id === schedule.environment_id);
              environmentName = environment?.environment_name || "No environment";
            }

            return {
              id: schedule.id,
              type:
                schedule.schedule_details.run_every_hours < 24
                  ? "hourly"
                  : "daily",
              interval:
                schedule.schedule_details.run_every_hours < 24
                  ? schedule.schedule_details.run_every_hours
                  : schedule.schedule_details.run_every_hours / 24,
              startTime: schedule.schedule_details.start_date_time,
              config: schedule.config || null,
              environment_id: environment?.environment_id || null,
              environment_name: environmentName,
              tag_filter: schedule.tag_filter || null,
            };
          }
        );
        setSchedules(formattedSchedules);
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setSchedulesLoading(false);
    }
  };

  useEffect(() => {
    if (currTab === TAB.SCHEDULES) {
      fetchSchedules();
    }
  }, [currTab]);

  // Refresh schedules when environments are loaded to show environment names
  useEffect(() => {
    if (currTab === TAB.SCHEDULES && environments.length > 0) {
      fetchSchedules();
    }
  }, [environments, currTab]);

  // Update environment selection when environments are loaded and modal is open
  useEffect(() => {
    if (isViewScheduleModalOpen && selectedSchedule && environments.length > 0) {
      // Set the environment selection based on the schedule's environment_id
      setScheduleEnvironmentId(selectedSchedule.environment_id || "no-environment");
    }
  }, [isViewScheduleModalOpen, selectedSchedule, environments]);

  useEffect(() => {
    if (currTab === TAB.FILES) {
      fetchFiles();
    }
    if (currTab === TAB.DATA) {
      fetchDataFiles();
    }
    if (currTab === TAB.ENVIRONMENTS) {
      // environments handled by context
    }
    if (currTab === TAB.SETTINGS) {
      loadEmailRecipients();
    }
    if (currTab === TAB.ELEMENTS) {
      fetchElements();
    }
  }, [currTab]);

  // Fetch stores when edit element modal opens
  useEffect(() => {
    if (showEditElementModal) {
      fetchStores();
    }
  }, [showEditElementModal]);

  const handleScheduleSubmit = async () => {
    try {
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      let startDateTime;
      if (scheduleType === "hourly") {
        // For hourly schedule, use current UTC time
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, "0");
        const day = String(now.getUTCDate()).padStart(2, "0");
        const hours = String(now.getUTCHours()).padStart(2, "0");
        const minutes = String(now.getUTCMinutes()).padStart(2, "0");
        startDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      } else {
        // For daily schedule, treat the selected time as GMT and format it
        // Get the date/time components and create a UTC date with those values
        const year = scheduleTime.year();
        const month = scheduleTime.month() + 1; // dayjs months are 0-indexed
        const day = scheduleTime.date();
        const hours = scheduleTime.hour();
        const minutes = scheduleTime.minute();
        startDateTime = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      }

      const scheduleData: any = {
        schedule_details: {
          run_every_hours:
            scheduleType === "hourly" ? hourlyInterval : hourlyInterval * 24,
          start_date_time: startDateTime,
        },
      };

      // Only include config if user has visited the config tab
      if (scheduleConfigTab === "config") {
        const [width, height] = scheduleConfig.viewport.split('x').map(Number);
        scheduleData.config = {
          browser: scheduleConfig.browser,
          device: {
            type: scheduleConfig.device,
            device_config: {
              os: scheduleConfig.os,
            }
          },
          viewport: {
            width: width,
            height: height
          }
        };
      }

      // Handle tag_filter based on condition
      if (scheduleConfigTab === "tags") {
        if (scheduleTagCondition === "no_filter") {
          scheduleData.tag_filter = {};
        } else if (selectedScheduleTags.length > 0) {
          scheduleData.tag_filter = {
            tags: selectedScheduleTags,
            condition: scheduleTagCondition
          };
        }
      }

      // Get environment id if an environment is selected
      const environmentId = scheduleEnvironmentId === "no-environment" ? null : scheduleEnvironmentId;

      const response = await createScheduleAPI(token, suite_id, scheduleData, environmentId);

      if (response.status === 200) {
        messageApi.success("Schedule created successfully");
        setIsCreateScheduleModalOpen(false);
        // Refresh the schedules list
        await fetchSchedules();
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    }
  };

  const handleUpdateSchedule = async () => {
    try {
      setIsUpdating(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      let startDateTime;
      if (scheduleType === "hourly") {
        // For hourly schedule, use current UTC time
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, "0");
        const day = String(now.getUTCDate()).padStart(2, "0");
        const hours = String(now.getUTCHours()).padStart(2, "0");
        const minutes = String(now.getUTCMinutes()).padStart(2, "0");
        startDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      } else {
        // For daily schedule, treat the selected time as GMT and format it
        // Get the date/time components and create a UTC date with those values
        const year = scheduleTime.year();
        const month = scheduleTime.month() + 1; // dayjs months are 0-indexed
        const day = scheduleTime.date();
        const hours = scheduleTime.hour();
        const minutes = scheduleTime.minute();
        startDateTime = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      }

      const scheduleData: any = {
        schedule_details: {
          run_every_hours:
            scheduleType === "hourly" ? hourlyInterval : hourlyInterval * 24,
          start_date_time: startDateTime,
        },
      };

      // Include config if user has visited the config tab or if config exists
      if (editScheduleConfigTab === "config" || selectedSchedule?.config) {
        const [width, height] = editScheduleConfig.viewport.split('x').map(Number);
        scheduleData.config = {
          browser: editScheduleConfig.browser,
          device: {
            type: editScheduleConfig.device,
            device_config: {
              os: editScheduleConfig.os,
            }
          },
          viewport: {
            width: width,
            height: height
          }
        };
      }

      // Always include tag_filter in payload
      if (editScheduleConfigTab === "tags") {
        // User has visited tags tab, use current state
        if (editScheduleTagCondition === "no_filter") {
          scheduleData.tag_filter = {};
        } else if (selectedEditScheduleTags.length > 0) {
          scheduleData.tag_filter = {
            tags: selectedEditScheduleTags,
            condition: editScheduleTagCondition
          };
        } else {
          // If schedule had tags but now all are removed, send empty tag_filter
          scheduleData.tag_filter = {};
        }
      } else {
        // User hasn't visited tags tab, preserve existing tags or send empty object
        if (selectedSchedule?.tag_filter) {
          scheduleData.tag_filter = selectedSchedule.tag_filter;
        } else {
          scheduleData.tag_filter = {};
        }
      }

      // Get environment id if an environment is selected
      const environmentId = scheduleEnvironmentId === "no-environment" ? null : scheduleEnvironmentId;

      const response = await updateScheduleAPI(
        token,
        suite_id,
        selectedSchedule.id,
        scheduleData,
        environmentId
      );

      if (response.status === 200) {
        messageApi.success("Schedule updated successfully");
        setIsViewScheduleModalOpen(false);
        setSelectedEditScheduleTags([]);
        setEditScheduleTagCondition("no_filter");
        setEditScheduleConfigTab("schedule");
        await fetchSchedules();
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      setDeleteLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await deleteScheduleAPI(token, suite_id, scheduleId);

      if (response.status === 200) {
        messageApi.success("Schedule deleted successfully");
        await fetchSchedules();
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setDeleteLoading(false);
      setIsDeleteScheduleModalOpen(false);
    }
  };

  const handleDeleteScheduleClick = (record: any) => {
    setScheduleToDelete(record);
    setIsDeleteScheduleModalOpen(true);
  };

  const scheduleColumns = [
    {
      title: "Schedule ID",
      dataIndex: "id",
      key: "id",
      render: (text: string, record: any) => (
        <p
          onClick={() => handleViewSchedule(record)}
          className="font-hanken cursor-pointer hover:!text-[#4542CC] text-[#4542CC]"
        >
          {text}
        </p>
      ),
    },
    {
      title: "Environment",
      dataIndex: "environment_name",
      key: "environment_name",
      render: (text: string, record: any) => (
        <p className="font-hanken text-[14px]">
          {record.environment_name || "No environment"}
        </p>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: 200,
      render: (text: any, record: any) => {
        const tags = record?.tag_filter?.tags || [];
        const tagFilter = record?.tag_filter;
        const condition = tagFilter?.condition;
        const maxVisibleTags = 3;
        const visibleTags = tags.slice(0, maxVisibleTags);
        const remainingTags = tags.slice(maxVisibleTags);

        return (
          <div className="flex flex-wrap gap-2 items-center max-w-[200px]">
            {condition && (
              <Tooltip title={condition === 'contains_any' ? 'Contains Any' : 'Does Not Contain Any'}>
                {condition === 'contains_any' ? (
                  <PlusOutlined className="text-[#20AD4C] text-[14px]" />
                ) : (
                  <MinusOutlined className="text-[#EA3962] text-[14px]" />
                )}
              </Tooltip>
            )}
            {tags.length > 0 ? (
              <>
                {visibleTags.map((tag: string, index: number) => (
                  <Tag key={index} className="font-hanken">
                    {tag}
                  </Tag>
                ))}
                {remainingTags.length > 0 && (
                  <Tooltip title={
                    <div>
                      {remainingTags.map((tag: string, index: number) => (
                        <Tag key={index} className="font-hanken m-1">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  }>
                    <span className="font-hanken text-[#AE00FF] cursor-pointer">...</span>
                  </Tooltip>
                )}
              </>
            ) : (
              <span className="font-hanken text-[14px] text-gray-400">-</span>
            )}
          </div>
        );
      },
    },
    {
      title: "Frequency",
      dataIndex: "interval",
      key: "interval",
      render: (text: number, record: any) => (
        <p className="font-hanken text-[14px]">
          Every {text} {record.type === "hourly" ? "hours" : "days"}
        </p>
      ),
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
      render: (text: string) => {
        if (!text) return <p className="font-hanken text-[14px]">-</p>;

        // Parse the time as UTC and format it as GMT
        // Try parsing as ISO string first, then as custom format
        let utcTime = dayjs.utc(text);

        // If parsing failed, try parsing without UTC first then converting
        if (!utcTime.isValid()) {
          utcTime = dayjs(text).utc();
        }

        const formattedTime = utcTime.isValid()
          ? utcTime.format("YYYY-MM-DD HH:mm [GMT]")
          : text;
        return (
          <p className="font-hanken text-[14px]">{formattedTime}</p>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (text: string, record: any) => (
        <div className="flex gap-2">
          <RoleBasedButton
            type="text"
            className="font-hanken border-none w-[50px] shadow-none !text-[#AE00FF] hover:!text-[#AE00FF]"
            size="small"
            onClick={() => handleViewSchedule(record)}
          >
            Edit
          </RoleBasedButton>
          <RoleBasedButton
            type="text"
            className="font-hanken ml-5 border-none shadow-none !text-[#EA3962] hover:!text-[#EA3962]"
            size="small"
            onClick={() => handleDeleteScheduleClick(record)}
          >
            Delete
          </RoleBasedButton>
        </div>
      ),
    },
  ];

  const fileColumns = [
    {
      title: "File Name",
      dataIndex: "file_name",
      key: "file_name",
      render: (text: string, record: any) => (
        <p className="font-hanken text-[14px]">{text}</p>
      ),
    },
    {
      title: "File ID",
      dataIndex: "file_id",
      key: "file_id",
      render: (text: string) => (
        <p className="font-hanken text-[14px]">{text}</p>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "start" as const,
      render: (text: string, record: any) => (
        <div className="flex gap-2">
          <RoleBasedButton
            type="text"
            className="font-hanken border-none shadow-none !text-[#AE00FF]"
            size="small"
            icon={<DownloadOutlined />}
            loading={downloadingFileId === record.file_id}
            onClick={() => handleDownloadFile(record)}
          >
            Download
          </RoleBasedButton>
          <RoleBasedButton
            type="text"
            className="font-hanken border-none shadow-none !text-[#AE00FF]"
            size="small"
            onClick={() => handleUpdateFileClick(record)}
          >
            Update
          </RoleBasedButton>
          <RoleBasedButton
            type="text"
            className="font-hanken border-none shadow-none !text-[#EA3962]"
            size="small"
            onClick={() => handleDeleteFileClick(record)}
          >
            Delete
          </RoleBasedButton>
        </div>
      ),
    },
  ];

  const dataFileColumns = [
    {
      title: "File Name",
      dataIndex: "file_name",
      key: "file_name",
      render: (text: string, record: any) => (
        <p className="font-hanken text-[14px]">{text}</p>
      ),
    },
    {
      title: "File ID",
      dataIndex: "file_id",
      key: "file_id",
      render: (text: string) => (
        <p className="font-hanken text-[14px]">{text}</p>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "start" as const,
      render: (text: string, record: any) => (
        <div className="flex gap-2">
          <RoleBasedButton
            type="text"
            className="font-hanken border-none shadow-none !text-[#AE00FF]"
            size="small"
            icon={<DownloadOutlined />}
            loading={downloadingFileId === record.file_id}
            onClick={() => handleDownloadFile(record)}
          >
            Download
          </RoleBasedButton>
          <RoleBasedButton
            type="text"
            className="font-hanken border-none shadow-none !text-[#AE00FF]"
            size="small"
            onClick={() => handleUpdateDataFileClick(record)}
          >
            Update
          </RoleBasedButton>
          <RoleBasedButton
            type="text"
            className="font-hanken border-none shadow-none !text-[#EA3962]"
            size="small"
            onClick={() => handleDeleteDataFileClick(record)}
          >
            Delete
          </RoleBasedButton>
        </div>
      ),
    },
  ];

  const elementsColumns = [
    ...(isMergeMode ? [{
      title: "",
      key: "selection",
      width: 50,
      render: (text: string, record: ElementResponse) => (
        <input
          type="checkbox"
          checked={selectedElementsForMerge.includes(record.element_id)}
          onChange={() => handleToggleElementSelection(record.element_id)}
          disabled={record.element_id === primaryElementId}
          className="cursor-pointer"
        />
      ),
    }] : []),
    {
      title: "Element",
      dataIndex: "element_id",
      key: "element_id",
      render: (text: string) => (
        <span className="font-hanken text-[14px]">
          {text}
        </span>
      ),
    },
    {
      title: "Prompt",
      dataIndex: "element_prompt",
      key: "element_prompt",
      render: (text: string, record: ElementResponse) => (
        <div className="flex flex-col">
          <p className="font-hanken text-[14px] font-medium">{text}</p>
          <p className="font-hanken text-[12px] text-gray-500">{record.element_description}</p>
        </div>
      ),
    },
    {
      title: "Store",
      dataIndex: "store_name",
      key: "store_name",
      render: (text: string, record: ElementResponse) => (
        <span className="font-hanken text-[14px] text-blue-600">
          {text || ''}
        </span>
      ),
    },
    {
      title: "Selectors",
      dataIndex: "selectors",
      key: "selectors",
      render: (selectors: any[], record: ElementResponse) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleViewSelectors(record)}
          className="font-hanken text-[14px] p-0 h-auto"
        >
          {selectors?.length || 0} selector{(selectors?.length || 0) !== 1 ? 's' : ''}
        </Button>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "start" as const,
      render: (text: string, record: ElementResponse) => (
        <div className="flex gap-2">
          {!isMergeMode && (
            <RoleBasedButton
              type="text"
              className="font-hanken border-none shadow-none !text-[#AE00FF]"
              size="small"
              onClick={() => handleStartMerge(record.element_id)}
            >
              Merge
            </RoleBasedButton>
          )}
          {!isMergeMode && (
            <RoleBasedButton
              type="text"
              className="font-hanken border-none shadow-none !text-[#AE00FF]"
              size="small"
              onClick={() => handleEditElement(record)}
            >
              Edit
            </RoleBasedButton>
          )}
          {!isMergeMode && (
            <RoleBasedButton
              type="text"
              className="font-hanken border-none shadow-none !text-[#EA3962]"
              size="small"
              onClick={() => handleDeleteElement(record)}
            >
              Delete
            </RoleBasedButton>
          )}
        </div>
      ),
    },
  ];

  const handleRunSuite = useCallback(async (config?: any) => {
    setRunSuiteLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) {
      messageApi.error("Authentication required");
      return;
    }

    try {
      let response;
      let runData: any = {};

      if (config) {
        // Send config with the run suite API
        const [width, height] = config.viewport.split('x').map(Number);
        runData.config = {
          browser: config.browser,
          device: {
            type: config.device,
            device_config: {
              os: config.os,
            }
          },
          viewport: {
            width: width,
            height: height
          }
        };
      }

      // Handle tag_filter based on condition
      if (runTagCondition === "no_filter") {
        runData.tag_filter = {};
      } else if (selectedRunTags.length > 0) {
        runData.tag_filter = {
          tags: selectedRunTags,
          condition: runTagCondition
        };
      }

      // Send runData if it has config or tag_filter, otherwise send undefined
      const payloadToSend = (runData.config || runData.tag_filter) ? runData : undefined;
      response = await runSuiteAPI(token, suite_id, payloadToSend, selectedEnvironment?.environment_id || null);

      if (response.status === 200) {
        setRunSuiteLoading(false);
        messageApi.success(response?.data?.message);
        setIsRunConfigModalOpen(false);
        setSelectedRunTags([]);
        setRunTagCondition("no_filter");
        setRunConfigTab("config");
      } else {
        setRunSuiteLoading(false);
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error) {
      setRunSuiteLoading(false);
      messageApi.error(extractErrorMessage(error));
    }
  }, [selectedEnvironment, suite_id, getToken, messageApi, selectedRunTags, runTagCondition]);

  const handleTableChange = (pagination: any) => {
    setSchedulesPagination(pagination);
  };

  const handleSuiteRunsTableChange = (newPagination: any) => {
    setSuiteRunsPagination((prev) => ({
      ...prev,
      current: newPagination?.current,
      pageSize: newPagination?.pageSize || prev.pageSize,
      total: newPagination?.total,
    }));
  };



  const handleSettingsChange = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSettingsSave = async () => {
    setSettingsLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) {
      messageApi.error("Authentication required");
      setSettingsLoading(false);
      return;
    }

    try {
      const [width, height] = settings.viewport.split('x').map(Number);

      // Determine heal_test and triage based on onTestFailure value
      let heal_test = false;
      let triage = false;

      if (settings.onTestFailure === "offer_heal_suggestions") {
        heal_test = true;
        triage = true;
      } else if (settings.onTestFailure === "triage_only") {
        heal_test = false;
        triage = true;
      } else {
        // nothing
        heal_test = false;
        triage = false;
      }

      const response = await updateTestSuiteAPI(token, suite_id, {
        config: {
          browser: settings.browser,
          device: {
            type: settings.device,
            device_config: {
              os: settings.os,
            }
          },
          viewport: {
            width: width,
            height: height
          }
        },
        heal_test: heal_test,
        triage: triage
      });

      if (response.status === 200) {
        messageApi.success("Settings saved successfully");
        getTestSuite(); // Refresh the test suite data
      } else {
        messageApi.error("Failed to save settings");
      }
    } catch (error: any) {
      messageApi.error(
        error.message || "An error occurred while saving settings"
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  // Email recipients functions
  const loadEmailRecipients = async () => {
    setEmailRecipientsLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) {
      messageApi.error("Authentication required");
      setEmailRecipientsLoading(false);
      return;
    }

    try {
      const response = await getEmailRecipientsAPI(token, suite_id);
      if (response.status === 200 && response.data) {
        setEmailRecipients(response.data.recipients || []);
      } else {
        messageApi.error(response.error || "Failed to load email recipients");
      }
    } catch (error: any) {
      messageApi.error(error.message || "An error occurred while loading email recipients");
    } finally {
      setEmailRecipientsLoading(false);
    }
  };

  const addEmailRecipient = async () => {
    const candidate = newEmail.trim().toLowerCase();
    if (!candidate) {
      messageApi.error("Please enter a valid email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidate)) {
      messageApi.error("Please enter a valid email address");
      return;
    }
    const normalizedList = emailRecipients.map(e => e.toLowerCase());
    if (normalizedList.includes(candidate)) {
      messageApi.error("This email is already in the list");
      return;
    }

    setIsAddingEmail(true);
    const token = await getToken({ template: "basic" });
    if (!token) {
      messageApi.error("Authentication required");
      setIsAddingEmail(false);
      return;
    }

    try {
      const updatedRecipients = [...emailRecipients, candidate];
      const response = await updateEmailRecipientsAPI(token, suite_id, { recipients: updatedRecipients });
      if (response.status === 200 && response.data) {
        setEmailRecipients(response.data.recipients || []);
        setNewEmail("");
        messageApi.success("Email added successfully");
      } else {
        messageApi.error(response.error || "Failed to add email");
      }
    } catch (error: any) {
      messageApi.error(error.message || "An error occurred while adding email");
    } finally {
      setIsAddingEmail(false);
    }
  };

  const removeEmailRecipient = async (emailToRemove: string): Promise<void> => {
    setDeletingEmail(emailToRemove);
    const token = await getToken({ template: "basic" });
    if (!token) {
      messageApi.error("Authentication required");
      setDeletingEmail(null);
      return;
    }

    try {
      const updatedRecipients = emailRecipients.filter(email => email !== emailToRemove);
      const response = await updateEmailRecipientsAPI(token, suite_id, {
        recipients: updatedRecipients
      });

      if (response.status === 200 && response.data) {
        setEmailRecipients(response.data.recipients || []);
        messageApi.success("Email removed successfully");
      } else {
        messageApi.error(response.error || "Failed to remove email");
      }
    } catch (error: any) {
      messageApi.error(error.message || "An error occurred while removing email");
    } finally {
      setDeletingEmail(null);
    }
  };

  const handleSaveSuiteName = async () => {
    if (!suiteName?.trim()) {
      messageApi.error("Suite name cannot be empty");
      return;
    }

    setUpdateLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) {
      messageApi.error("Authentication required");
      setUpdateLoading(false);
      return;
    }

    try {
      const response = await updateTestSuiteAPI(token, suite_id, {
        name: suiteName,
        sign_in_url: formFields.sign_in_url,
        username: formFields.username,
        password: formFields.password,
      });

      if (response.status === 200) {
        setTestSuite(response.data);
        setContextSuite(response.data);
        setEditSuiteName(false);
        messageApi.success("Suite name updated successfully");
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSaveSuiteDescription = async () => {
    setUpdateLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) {
      messageApi.error("Authentication required");
      setUpdateLoading(false);
      return;
    }

    try {
      const response = await updateTestSuiteAPI(token, suite_id, {
        name: testSuite?.name,
        description: suiteDescription,
        sign_in_url: formFields.sign_in_url,
        username: formFields.username,
        password: formFields.password,
      });

      if (response.status === 200) {
        setTestSuite(response.data);
        setContextSuite(response.data);
        setEditSuiteDescription(false);
        messageApi.success("Suite description updated successfully");
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleGenerateTestPlans = async () => {
    if (!planDescription?.trim()) {
      messageApi.error("Please enter a feature description");
      return;
    }

    setPlanLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) {
      messageApi.error("Authentication required");
      setPlanLoading(false);
      return;
    }

    try {
      const response = await generateTestPlansAPI(token, suite_id, planDescription);

      if (response.status === 200) {
        setGeneratedTests(response.data.tests || []);
        setDiscardedTests(new Set()); // Reset discarded tests
        messageApi.success("Test plans generated successfully");
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setPlanLoading(false);
    }
  };

  const handleDiscardTest = (index: number) => {
    setDiscardedTests(prev => new Set(Array.from(prev).concat(index)));
  };

  const handleUndiscardTest = (index: number) => {
    setDiscardedTests(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleBulkCreateTests = async () => {
    const testsToCreate = generatedTests.filter((_, index) => !discardedTests.has(index));

    if (testsToCreate.length === 0) {
      messageApi.error("No tests to create. Please select at least one test.");
      return;
    }

    setBulkCreateLoading(true);
    const token = await getToken({ template: "basic" });
    if (!token) {
      messageApi.error("Authentication required");
      setBulkCreateLoading(false);
      return;
    }

    try {
      const response = await bulkCreateTestsAPI(token, suite_id, testsToCreate);

      if (response.status === 200) {
        messageApi.success("Tests created successfully");
        // Reset the plan state
        setGeneratedTests([]);
        setDiscardedTests(new Set());
        setPlanDescription("");
        // Refresh the tests tab
        getTestSuite();
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setBulkCreateLoading(false);
    }
  };

  // File management functions
  const fetchFiles = async () => {
    try {
      setFilesLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await getFilesAPI(token, suite_id);
      if (response.status === 200) {
        setFiles(response.data.files || []);
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setFilesLoading(false);
    }
  };

  const fetchElements = async () => {
    try {
      setElementsLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await getElementsAPI(token, suite_id);
      if (response.status === 200) {
        // Parse the JSON string response if needed
        const parsedData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        setElements(parsedData.elements || []);
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setElementsLoading(false);
    }
  };

  // Element handler functions
  const handleViewSelectors = (record: ElementResponse) => {
    setSelectedElementSelectors(record.selectors || []);
    // Always start with first selector selected
    const selectedIndex = 0;
    setSelectedSelectorIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setSelectedElementForEdit(record);
    setShowSelectorsModal(true);
  };

  const handleSaveSelector = async () => {
    if (!selectedElementForEdit) return;

    setUpdateSelectorLoading(true);
    try {
      const token = await getToken({ template: "basic" });
      if (!token) return;

      // Move selected selector to index 0
      const reorderedSelectors = [...selectedElementSelectors];
      const [selectedSelector] = reorderedSelectors.splice(selectedSelectorIndex, 1);
      reorderedSelectors.unshift(selectedSelector);

      await updateElementAPI(token, suite_id, selectedElementForEdit.element_id, {
        element_description: selectedElementForEdit.element_description,
        element_prompt: selectedElementForEdit.element_prompt,
        store_name: selectedElementForEdit.store_name,
        selectors: reorderedSelectors
      });

      // Update local state
      setElements(prev => prev.map(elem => {
        if (elem.element_id === selectedElementForEdit.element_id) {
          return {
            ...elem,
            selectors: reorderedSelectors
          };
        }
        return elem;
      }));

      messageApi.success("Primary selector updated successfully");
      setShowSelectorsModal(false);
    } catch (error) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setUpdateSelectorLoading(false);
    }
  };

  const handleEditElement = (record: ElementResponse) => {
    setSelectedElementForEdit(record);
    setShowEditElementModal(true);
  };

  const handleDeleteElement = (record: ElementResponse) => {
    setDeleteElementId(record.element_id);
  };

  const handleDeleteElementConfirm = async (id: string) => {
    try {
      setDeleteLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await deleteElementAPI(token, suite_id, id);
      if (response.status === 200) {
        messageApi.success("Element deleted successfully");
        fetchElements(); // Refresh the elements list
        setDeleteElementId("");
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveElement = async () => {
    if (!selectedElementForEdit) return;

    try {
      setUpdateElementLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const payload = {
        element_description: selectedElementForEdit.element_description,
        element_prompt: selectedElementForEdit.element_prompt,
        store_name: selectedElementForEdit.store_name || undefined,
        selectors: selectedElementForEdit.selectors || []
      };

      const response = await updateElementAPI(token, suite_id, selectedElementForEdit.element_id, payload);
      if (response.status === 200) {
        messageApi.success("Element updated successfully");
        fetchElements(); // Refresh the elements list
        setShowEditElementModal(false);
        setSelectedElementForEdit(null);
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setUpdateElementLoading(false);
    }
  };

  // Store management functions
  const fetchStores = async () => {
    try {
      setStoresLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await getStoresAPI(token, suite_id);
      setStores(response.stores || []);
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setStoresLoading(false);
    }
  };

  const handleCreateStore = async (data: { store_name: string; store_description?: string }) => {
    try {
      setCreateStoreLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const payload = {
        store_name: data.store_name,
        store_description: data.store_description || undefined,
        suite_id: suite_id,
      };

      await createStoreAPI(token, suite_id, payload);
      messageApi.success("Store created successfully");

      // Close the create store modal
      setShowCreateStoreModal(false);

      // Update the selected element with the new store name
      if (selectedElementForEdit) {
        setSelectedElementForEdit({
          ...selectedElementForEdit,
          store_name: data.store_name
        });
      }

      // Refresh the stores list
      await fetchStores();
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
      throw error; // Re-throw to let the modal handle the error state
    } finally {
      setCreateStoreLoading(false);
    }
  };

  // Merge elements handlers
  const handleStartMerge = (elementId: string) => {
    setPrimaryElementId(elementId);
    setIsMergeMode(true);
    setSelectedElementsForMerge([]);
  };

  const handleCancelMerge = () => {
    setIsMergeMode(false);
    setPrimaryElementId("");
    setSelectedElementsForMerge([]);
  };

  const handleToggleElementSelection = (elementId: string) => {
    if (elementId === primaryElementId) return; // Can't select primary element

    setSelectedElementsForMerge(prev =>
      prev.includes(elementId)
        ? prev.filter(id => id !== elementId)
        : [...prev, elementId]
    );
  };

  const handleMergeElements = async () => {
    if (selectedElementsForMerge.length === 0) {
      messageApi.error("Please select at least one element to merge");
      return;
    }

    try {
      setMergeLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const payload = {
        primary_element_id: primaryElementId,
        secondary_element_ids: selectedElementsForMerge,
      };

      await mergeElementsAPI(token, suite_id, payload);
      messageApi.success("Elements merged successfully");

      // Reset merge state
      handleCancelMerge();

      // Refresh the elements list
      await fetchElements();
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setMergeLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploadLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await uploadFileAPI(token, suite_id, file);
      if (response.status === 200) {
        messageApi.success("File uploaded successfully");
        await fetchFiles(); // Refresh the files list
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setUploadLoading(false);
    }
  };

  const handleViewFile = async (record: any) => {
    try {
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await getFileAPI(token, suite_id, record.file_id);
      if (response.status === 200) {
        setSelectedFile(response.data);
        setIsViewFileModalOpen(true);
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      setDeleteLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await deleteFileAPI(token, suite_id, fileId);
      if (response.status === 200) {
        messageApi.success("File deleted successfully");
        await fetchFiles(); // Refresh the files list
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setDeleteLoading(false);
      setIsDeleteFileModalOpen(false);
    }
  };

  const handleDeleteFileClick = (record: any) => {
    setFileToDelete(record);
    setIsDeleteFileModalOpen(true);
  };

  const handleUpdateFileClick = (record: any) => {
    setFileToUpdate(record);
    setIsUpdateFileModalOpen(true);
  };

  const handleDownloadFile = async (record: any) => {
    try {
      setDownloadingFileId(record.file_id);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        setDownloadingFileId(null);
        return;
      }

      const response = await downloadFileAPI(token, suite_id, record.file_id, record.file_name);
      if (response.status === 200) {
        messageApi.success("File downloaded successfully");
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleUpdateFile = async (file: File) => {
    try {
      setUpdateFileLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await updateFileAPI(token, suite_id, fileToUpdate.file_id, file);
      if (response.status === 200) {
        messageApi.success("File updated successfully");
        setIsUpdateFileModalOpen(false);
        setFileToUpdate(null);
        await fetchFiles(); // Refresh the files list
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setUpdateFileLoading(false);
    }
  };

  // Data file management functions
  const fetchDataFiles = async () => {
    try {
      setDataFilesLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await getFilesAPI(token, suite_id, "data");
      if (response.status === 200) {
        setDataFiles(response.data.files || []);
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setDataFilesLoading(false);
    }
  };

  const handleDataFileUpload = async (file: File) => {
    try {
      setDataUploadLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await uploadFileAPI(token, suite_id, file, "data");
      if (response.status === 200) {
        messageApi.success("Data file uploaded successfully");
        await fetchDataFiles(); // Refresh the data files list
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setDataUploadLoading(false);
    }
  };

  const handleViewDataFile = async (record: any) => {
    try {
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await getFileAPI(token, suite_id, record.file_id);
      if (response.status === 200) {
        setSelectedDataFile(response.data);
        setIsViewDataFileModalOpen(true);
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    }
  };

  const handleDeleteDataFile = async (fileId: string) => {
    try {
      setDeleteLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await deleteFileAPI(token, suite_id, fileId);
      if (response.status === 200) {
        messageApi.success("Data file deleted successfully");
        await fetchDataFiles(); // Refresh the data files list
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setDeleteLoading(false);
      setIsDeleteDataFileModalOpen(false);
    }
  };

  const handleDeleteDataFileClick = (record: any) => {
    setDataFileToDelete(record);
    setIsDeleteDataFileModalOpen(true);
  };

  const handleUpdateDataFileClick = (record: any) => {
    setDataFileToUpdate(record);
    setIsUpdateDataFileModalOpen(true);
  };

  const handleUpdateDataFile = async (file: File) => {
    try {
      setUpdateDataFileLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await updateFileAPI(token, suite_id, dataFileToUpdate.file_id, file);
      if (response.status === 200) {
        messageApi.success("Data file updated successfully");
        setIsUpdateDataFileModalOpen(false);
        setDataFileToUpdate(null);
        await fetchDataFiles(); // Refresh the data files list
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setUpdateDataFileLoading(false);
    }
  };

  // Segments management functions
  const fetchSegments = async () => {
    try {
      setSegmentsLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await getSegmentsBySuiteAPI(token, suite_id);
      if (response.status === 200) {
        const segmentsWithSuiteId = (response.data.test_segments || []).map((segment: any) => ({
          ...segment,
          suite_id: suite_id
        }));
        setSegments(segmentsWithSuiteId);
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setSegmentsLoading(false);
    }
  };

  const handleCreateSegment = async (form: {
    segment_name: string;
    test_id: string;
    start_instruction_id: string;
    end_instruction_id: string;
  }) => {
    try {
      setSegmentLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const payload: CreateSegmentRequest = {
        segment_name: form.segment_name,
        test_id: form.test_id,
        start_instruction_id: form.start_instruction_id,
        end_instruction_id: form.end_instruction_id,
      };

      const response = await createSegmentAPI(token, payload);
      if (response.status === 200) {
        messageApi.success("Segment created successfully");
        setIsCreateSegmentModalOpen(false);
        await fetchSegments();
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setSegmentLoading(false);
    }
  };

  const handleUpdateSegment = async (form: {
    segment_name: string;
    test_id: string;
    start_instruction_id: string;
    end_instruction_id: string;
  }) => {
    try {
      setSegmentLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      if (!selectedSegment) {
        messageApi.error("No segment selected");
        return;
      }

      const payload: UpdateSegmentRequest = {
        segment_name: form.segment_name,
        test_id: form.test_id,
        start_instruction_id: form.start_instruction_id,
        end_instruction_id: form.end_instruction_id,
      };

      const response = await updateSegmentAPI(token, selectedSegment.segment_id, payload);
      if (response.status === 200) {
        messageApi.success("Segment updated successfully");
        setIsUpdateSegmentModalOpen(false);
        setSelectedSegment(null);
        await fetchSegments();
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setSegmentLoading(false);
    }
  };

  const handleDeleteSegmentClick = (segment: TestSegment) => {
    setSegmentToDelete(segment);
    setIsDeleteSegmentModalOpen(true);
  };

  const handleDeleteSegment = async (segmentId: string) => {
    try {
      setSegmentLoading(true);
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await deleteSegmentAPI(token, segmentId);
      if (response.status === 200) {
        messageApi.success("Segment deleted successfully");
        setIsDeleteSegmentModalOpen(false);
        setSegmentToDelete(null);
        await fetchSegments();
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error) {
      messageApi.error(extractErrorMessage(error));
    } finally {
      setSegmentLoading(false);
    }
  };

  const handleEditSegment = async (segment: TestSegment) => {
    setSelectedSegment(segment);
    setIsUpdateSegmentModalOpen(true);
  };

  // Format instruction value for display
  // Note: All segment modal logic (formatInstructionValue, loadTestInstructions, etc.) is now handled by SegmentModal component

  // Environment handlers - now handled by context

  const handleCreateEnv = () => {
    window.open(`/dashboard/suite/${suite_id}/environment/new`, '_blank');
  };


  const handleDeleteEnv = async (environment: Environment) => {
    try {
      const token = await getToken({ template: "basic" });
      if (!token) {
        messageApi.error("Authentication required");
        return;
      }

      const response = await deleteEnvironmentAPI(token, environment.environment_id);
      if (response.status === 200) {
        messageApi.success("Environment deleted successfully");

        // Clear selected environment if it was the currently selected one
        if (selectedEnvironment?.environment_id === environment.environment_id) {
          setSelectedEnvironment(null);
        }

        triggerRefresh(); // Trigger refresh in context
      } else {
        messageApi.error(extractErrorMessage(response));
      }
    } catch (error: any) {
      messageApi.error(extractErrorMessage(error));
    }
  };

  const segmentsColumns = useMemo(() => [
    {
      title: "Segment Name",
      dataIndex: "segment_name",
      key: "segment_name",
      render: (text: string) => (
        <span className="font-hanken text-sm font-medium">{text || "Unnamed Segment"}</span>
      ),
    },
    {
      title: "Test Name",
      dataIndex: "test_name",
      key: "test_name",
      render: (text: string, record: TestSegment) => {
        const test = testSuite?.tests?.find((t: any) => t.id === record.test_id);
        return (
          <div className="flex items-center gap-2">
            <span className="font-hanken text-sm">{test?.name || record.test_id}</span>
            <Tooltip title="Go to test">
              <Link
                href={`/dashboard/suite/${suite_id}/test/${record.test_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExportOutlined className="text-[#AE00FF] cursor-pointer hover:text-[#8e00cc] text-xs" aria-label="Go to test" />
              </Link>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Start Instruction ID",
      dataIndex: "start_instruction_id",
      key: "start_instruction_id",
      render: (text: string) => (
        <span className="font-hanken text-sm">{text}</span>
      ),
    },
    {
      title: "End Instruction ID",
      dataIndex: "end_instruction_id",
      key: "end_instruction_id",
      render: (text: string) => (
        <span className="font-hanken text-sm">{text}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text: any, record: TestSegment) => (
        <div className="flex gap-2">
          <RoleBasedButton
            type="text"
            size="small"
            onClick={() => handleEditSegment(record)}
            className="font-hanken border-none shadow-none !text-[#AE00FF] hover:!text-[#AE00FF]"
          >
            Edit
          </RoleBasedButton>
          <RoleBasedButton
            type="text"
            size="small"
            onClick={() => handleDeleteSegmentClick(record)}
            className="font-hanken border-none shadow-none !text-[#EA3962] hover:!text-[#EA3962]"
          >
            Delete
          </RoleBasedButton>
        </div>
      ),
    },
  ], [handleEditSegment, handleDeleteSegmentClick]);

  return (
    <>
      {contextHolder}
      {initialError && (
        <div className="mx-6 mt-4">
          <Alert type="error" message={initialError} showIcon />
        </div>
      )}
      <MaxWidthWrapper className="px-12">
        <div className="flex justify-between mt-5">
          <div className="flex flex-col gap-2 flex-1 max-w-3xl">
            <div className="flex items-center gap-2">
              {editSuiteName ? (
                <div className="flex flex-col items-end gap-2" data-testid="suite-name-edit-form">
                  <Input
                    className="text-[28px] font-hanken"
                    value={suiteName}
                    onChange={(e) => setSuiteName(e.target.value)}
                    onPressEnter={handleSaveSuiteName}
                    autoFocus
                    data-testid="suite-name-input"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="small"
                      onClick={handleSaveSuiteName}
                      loading={updateLoading}
                      data-testid="suite-name-save-button"
                      className="bg-[#AE00FF] border-2 border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF] rounded-[6px] text-white font-hanken text-[14px] font-medium"
                    >
                      Save
                    </Button>
                    <Button
                      size="small"
                      data-testid="suite-name-cancel-button"
                      onClick={() => {
                        setEditSuiteName(false);
                        setSuiteName(testSuite?.name || "");
                      }}
                      className="bg-white hover:!bg-white text-black border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!text-black font-hanken"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {testSuite ? (
                    <div className="flex items-center gap-2">
                      {currentUserDetails?.role !== 'viewer' && <NextImage
                        src="/assets/pencil.svg"
                        width={16}
                        height={16}
                        alt="edit"
                        className="cursor-pointer"
                        onClick={() => setEditSuiteName(true)}
                        data-testid="suite-name-edit-icon"
                      />}
                      <h1 className="font-hanken text-[28px]" data-testid="suite-name">{testSuite?.name}</h1>
                      {currentUserDetails?.role !== 'viewer' && (
                        <Tooltip title="Share Suite">
                          <RoleBasedButton
                            type="default"
                            icon={<NextImage src="/assets/share.svg" width={19} height={19} alt="share" />}
                            onClick={() => setShowShareModal(true)}
                            className="font-hanken bg-white border-2 border-[#DD94FF] !text-[#AE00FF] hover:!bg-white hover:!text-[#AE00FF] hover:!border-[#AE00FF]"
                            data-testid="suite-share-button"
                          >

                          </RoleBasedButton>
                        </Tooltip>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Skeleton.Avatar active size={32} />
                      <Skeleton.Input active size="large" style={{ width: 300, height: 34 }} />
                    </div>
                  )}
                </>
              )}
            </div>
            {/* Suite Description */}
            <div className="flex items-start gap-2 w-full">
              {editSuiteDescription ? (
                <div className="flex flex-col gap-2 w-full">
                  <Input.TextArea
                    className="w-full font-hanken"
                    value={suiteDescription}
                    onChange={(e) => setSuiteDescription(e.target.value)}
                    placeholder="Enter suite description"
                    rows={3}
                    autoFocus
                    data-testid="suite-description-input"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      size="small"
                      onClick={handleSaveSuiteDescription}
                      loading={updateLoading}
                      className="bg-[#AE00FF] border-2 border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF] rounded-[6px] text-white font-hanken text-[14px] font-medium"
                      data-testid="suite-description-save-button"
                    >
                      Save
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setEditSuiteDescription(false);
                        setSuiteDescription(testSuite?.description || "");
                      }}
                      className="bg-white hover:!bg-white text-black border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!text-black font-hanken"
                      data-testid="suite-description-cancel-button"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {testSuite ? (
                    <div className="flex items-start gap-2 w-full">
                      {currentUserDetails?.role !== 'viewer' && <NextImage
                        src="/assets/pencil.svg"
                        width={16}
                        height={16}
                        alt="edit"
                        className="cursor-pointer"
                        onClick={() => setEditSuiteDescription(true)}
                        data-testid="suite-description-edit-icon"
                      />}
                      <p className="font-hanken text-[14px] text-gray-600 break-words flex-1" data-testid="suite-description">
                        {suiteDescription || "No description provided"}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <Skeleton.Avatar active size={24} />
                      <Skeleton.Input active style={{ width: '100%', height: 20 }} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex">
            <>
              <Button
                size="large"
                loading={runSuiteLoading}
                onClick={() => handleRunSuite()}
                className="font-hanken text-[14px] rounded-r-none rounded-[6px] border-r-0  border-2 !border-[#DD94FF] hover:!border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF]"
                data-testid="suite-run-button"
              >
                Run
              </Button>
              <div className="w-[2px] h-[40px] bg-white border-t-2 border-b-2 border-l-0 border-r-0 border-t-[#DD94FF] border-b-[#DD94FF] rounded-none"></div>
              <div className="text-[14px] h-[40px] mr-2 border-l-white rounded-r-[6px] w-[32px] flex items-center justify-center px-2 border-l-0 border-t-2 border-r-2 border-b-2 !border-[#DD94FF] hover:!border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF]" data-testid="suite-run-dropdown-container">
                <Dropdown
                  placement="bottom"
                  className="text-[14px] cursor-pointer flex items-center justify-center !rounded-[6px]"
                  menu={{
                    items: [
                      {
                        key: 'default',
                        label: 'Default config',
                        onClick: () => handleRunSuite()
                      },
                      {
                        key: 'choose',
                        label: 'Choose config',
                        onClick: () => setIsRunConfigModalOpen(true)
                      }
                    ],
                  }}
                  data-testid="suite-run-dropdown"
                >
                  <DownOutlined className="text-xs" data-testid="suite-run-dropdown-trigger" />
                </Dropdown>
              </div>
              {/* <Button
                size="large"
                loading={runSuiteLoading}
                className="bg-white min-w-[94px] text-[14px] font-hanken text-black border-2 border-[#DD94FF] rounded-[6px] hover:!border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF] flex items-center gap-1"
              >
                Run

              </Button>
              <div className="w-[2px] bg-white border-t-2 border-b-2 border-l-0 border-r-0 border-t-[#AE00FF] border-b-[#AE00FF] rounded-none"></div>
              <div className="text-[14px] bg-white border-l-white rounded-r-[6px] text-black w-[5px] flex items-center justify-center px-2 border-l-0 border-[#DD94FF]">
                <Dropdown

                  menu={{
                    items: [
                      {
                        key: 'default',
                        label: 'Default config',
                        onClick: () => handleRunSuite()
                      },
                      {
                        key: 'choose',
                        label: 'Choose config',
                        onClick: () => setIsRunConfigModalOpen(true)
                      }
                    ]
                  }}
                  trigger={['click']}
                >
                  <DownOutlined className="text-xs" />

                </Dropdown>
              </div> */}

              <Link href={`/dashboard/suite/${suite_id}/test/new/compose`} onClick={onTestNavClick}>
                <RoleBasedButton
                  size="large"
                  className="!bg-white min-w-[94px] text-[14px] font-hanken !text-black !border-2 !border-[#DD94FF] rounded-[6px] hover:!border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF]"
                  data-testid="suite-add-test-button"
                >
                  Add test
                </RoleBasedButton>
              </Link>
            </>
          </div>
        </div>
        <div className="py-5 flex gap-5">
          <Tabs
            className="font-hanken w-full"
            defaultActiveKey={currTab.toString()}
            onChange={(key: string) => handleTabChange(parseInt(key))}
            data-testid="suite-tabs"
            tabBarExtraContent={
              currTab === TAB.SCHEDULES
                ? {
                  right: (
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleCreateSchedule}
                      className="font-hanken shadow-[30%] mb-2 bg-white text-[14px] text-black border-2 border-[#DD94FF] rounded-[6px] hover:!border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF]"
                      data-testid="suite-add-schedule-button"
                    >
                      Add schedule
                    </Button>
                  )
                }
                : currTab === TAB.ENVIRONMENTS
                  ? {
                    right: (
                      <RoleBasedButton
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={handleCreateEnv}
                        className="font-hanken shadow-[30%] mb-2 !bg-white text-[14px] !text-black border-2 !border-[#DD94FF] rounded-[6px] hover:!border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF]"
                        data-testid="suite-add-environment-button"
                      >
                        Add Environment
                      </RoleBasedButton>
                    )
                  }
                  : currTab === TAB.FILES
                    ? {
                      right: (
                        <Upload
                          beforeUpload={(file) => {
                            handleFileUpload(file);
                            return false; // Prevent default upload behavior
                          }}
                          showUploadList={false}
                          accept="*/*"
                        >
                          <RoleBasedButton
                            type="primary"
                            size="large"
                            icon={<UploadOutlined />}
                            loading={uploadLoading}
                            className="font-hanken shadow-[30%] mb-2 !bg-white text-[14px] !text-black border-2 !border-[#DD94FF] rounded-[6px] hover:!border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF]"
                            data-testid="suite-upload-file-button"
                          >
                            Upload File
                          </RoleBasedButton>
                        </Upload>
                      )
                    }
                    : currTab === TAB.DATA
                      ? {
                        right: (
                          <Upload
                            beforeUpload={(file) => {
                              // Check if file is CSV
                              if (!file.name.toLowerCase().endsWith('.csv')) {
                                messageApi.error('Only CSV files are allowed');
                                return false;
                              }
                              handleDataFileUpload(file);
                              return false; // Prevent default upload behavior
                            }}
                            showUploadList={false}
                            accept=".csv"
                          >
                            <RoleBasedButton
                              type="primary"
                              size="large"
                              icon={<UploadOutlined />}
                              loading={dataUploadLoading}
                              className="font-hanken shadow-[30%] mb-2 !bg-white text-[14px] !text-black border-2 !border-[#DD94FF] rounded-[6px] hover:!border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF]"
                              data-testid="suite-upload-csv-button"
                            >
                              Upload CSV
                            </RoleBasedButton>
                          </Upload>
                        )
                      }
                      : currTab === TAB.SEGMENTS
                        ? {
                          right: (
                            <RoleBasedButton
                              type="primary"
                              size="large"
                              onClick={() => setIsCreateSegmentModalOpen(true)}
                              className="font-hanken !bg-white text-[14px] !text-black border-2 !border-[#DD94FF] rounded-[6px] hover:!border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF]"
                            >
                              <PlusOutlined />
                              Add Segment
                            </RoleBasedButton>
                          )
                        }
                        : null
            }
            items={[
              {
                key: String(TAB.TESTS),
                label: "Tests",
                children: (
                  !testsLoading && testSuite && (!testSuite.tests || testSuite.tests.length === 0) && !appliedSearchQuery && !appliedStatusFilter && !appliedLastRunFilter ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4" data-testid="suite-tests-empty-state">
                      <div className="font-hanken text-[16px] mt-10 text-gray-600 mb-6 text-center">
                        Looks like you&apos;re just getting started! Just enter a URL and start creating a new test.
                      </div>
                      <div className="flex gap-3 w-full max-w-5xl items-start">
                        <Input

                          placeholder="Enter URL"
                          className={`font-hanken flex-1 ${emptyStateUrlError ? '!border-[#EA3962] hover:!border-[#EA3962] focus:!border-[#EA3962]' : ''}`}
                          value={emptyStateUrl}
                          onChange={(e) => {
                            setEmptyStateUrl(e.target.value);
                            if (emptyStateUrlError) setEmptyStateUrlError(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleStartTestingFromEmptyState();
                            }
                          }}
                          status={emptyStateUrlError ? "error" : ""}
                          data-testid="suite-empty-state-url-input"
                        />
                        <RoleBasedButton

                          className="!bg-[#AE00FF] text-[16px] !border-2 !border-[#AE00FF] !text-white font-hanken px-6"
                          onClick={handleStartTestingFromEmptyState}
                          data-testid="suite-empty-state-start-testing-button"
                        >
                          Start testing
                        </RoleBasedButton>
                      </div>
                      {emptyStateUrlError && (
                        <p className="text-[#EA3962] text-center font-hanken mt-2 max-w-5xl w-full" data-testid="suite-empty-state-url-error">
                          Please enter a valid URL
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <TestFilters
                        onApply={handleApplyFilters}
                        onClear={handleClearFilters}
                        initialQuery={appliedSearchQuery}
                        initialStatus={appliedStatusFilter}
                        initialLastRun={appliedLastRunFilter}
                      />
                      <Table
                        className="font-hanken"
                        loading={testsLoading}
                        columns={columns}
                        dataSource={data}
                        rowKey={(record) => record.key}
                        pagination={{
                          current: testsPagination.current,
                          pageSize: testsPagination.pageSize,
                          total: testsPagination.total,
                          onChange: (page, pageSize) => {
                            setTestsPagination({ current: page, pageSize: pageSize || 50, total: testsPagination.total });
                          },
                          showSizeChanger: true,
                          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tests`,
                        }}
                        locale={{
                          emptyText: testsLoading ? (
                            <div></div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <p className="text-lg font-hanken">
                                {appliedSearchQuery || appliedStatusFilter || appliedLastRunFilter
                                  ? "No tests found matching your filters"
                                  : "No tests found"}
                              </p>
                              {(appliedSearchQuery || appliedStatusFilter || appliedLastRunFilter) && (
                                <p className="text-sm mt-2">
                                  Try adjusting your filters
                                </p>
                              )}
                            </div>
                          ),
                        }}
                        data-testid="suite-tests-table"
                      />
                    </>
                  )
                ),
              },
              {
                key: String(TAB.FILES),
                label: "Files",
                children: (
                  <div className="w-full">
                    <Table
                      className="font-hanken"
                      size="small"
                      loading={filesLoading}
                      columns={fileColumns}
                      dataSource={files}
                      rowKey={(record) => record?.file_id ?? record?.file_name ?? ''}
                      pagination={false}
                      data-testid="suite-files-table"
                    />
                  </div>
                ),
              },
              {
                key: String(TAB.DATA),
                label: "Data",
                children: (
                  <div className="w-full">
                    <Table
                      className="font-hanken"
                      size="small"
                      loading={dataFilesLoading}
                      columns={dataFileColumns}
                      dataSource={dataFiles}
                      rowKey={(record) => record?.file_id ?? record?.file_name ?? ''}
                      pagination={false}
                      data-testid="suite-data-table"
                    />
                  </div>
                ),
              },
              {
                key: String(TAB.ENVIRONMENTS),
                label: "Environments",
                children: (
                  <div className="w-full">
                    <Table
                      className="font-hanken"
                      size="small"
                      loading={environmentsLoading}
                      data-testid="suite-environments-table"
                      columns={[
                        {
                          title: "Environment Name",
                          dataIndex: "environment_name",
                          key: "environment_name",
                          render: (text: string, record: Environment) => (
                            <div className="flex items-center gap-2">
                              <span className="font-hanken font-medium">{text}</span>
                              <Tooltip title="Go to environment">
                                <Link target="_blank" href={`/dashboard/suite/${suite_id}/environment/${record.environment_id}`}>
                                  <ExportOutlined
                                    className="text-[#AE00FF] cursor-pointer hover:text-[#8e00cc] text-xs"
                                  />
                                </Link>
                              </Tooltip>
                            </div>
                          ),
                        },
                        {
                          title: "Variables",
                          dataIndex: "variables",
                          key: "variables",
                          render: (variables: { [key: string]: string }) => (
                            <span className="font-hanken text-gray-600">
                              {Object.keys(variables).length} variable{Object.keys(variables).length !== 1 ? 's' : ''}
                            </span>
                          ),
                        },
                        {
                          title: "Actions",
                          key: "actions",
                          render: (_, record: Environment) => (
                            <RoleBasedButton
                              type="text"
                              size="small"
                              onClick={() => handleDeleteEnv(record)}
                              className="font-hanken border-none shadow-none !text-[#EA3962] hover:!text-[#EA3962]"
                              data-testid={`delete-environment-${record.environment_id}`}
                            >
                              Delete
                            </RoleBasedButton>
                          ),
                        },
                      ]}
                      dataSource={environments}
                      rowKey={(record) => record?.environment_id ?? record?.environment_name ?? ''}
                      pagination={false}
                      locale={{
                        emptyText: (
                          <div className="text-center py-8 text-gray-500">
                            <p className="text-lg font-hanken">No environments found</p>
                            <p className="text-sm">Create your first environment to get started</p>
                          </div>
                        ),
                      }}
                    />
                  </div>
                ),
              },

              {
                key: String(TAB.LOGS),
                label: "Logs",
                children: (
                  <div className="flex flex-col w-full gap-2">

                    <div className="mb-3 max-h-[calc(100vh-75px)] overflow-x-hidden overflow-y-auto">
                      <Table
                        className="font-hanken cursor-pointer"
                        size="small"
                        onRow={onRowClick}
                        loading={suiteRunsLoading}
                        columns={suiteRunColumns}
                        dataSource={suiteRunData}
                        rowKey={(record) => record?.key ?? record?.runId ?? ''}
                        pagination={suiteRunsPagination}
                        onChange={handleSuiteRunsTableChange}
                      />
                    </div>

                  </div>
                ),
              },
              {
                key: String(TAB.SCHEDULES),
                label: "Schedules",
                children: (
                  <div className="w-full">
                    <Table
                      className="font-hanken"
                      size="small"
                      loading={schedulesLoading}
                      columns={scheduleColumns}
                      dataSource={schedules}
                      rowKey={(record) => record?.id ?? record?.schedule_id ?? ''}
                      pagination={schedulesPagination}
                      onChange={handleTableChange}
                      data-testid="suite-schedules-table"
                    />
                  </div>
                ),
              },
              {
                key: String(TAB.SETTINGS),
                label: "Settings",
                children: (
                  <div className="flex flex-col gap-6 w-full max-w-2xl">
                    <Config
                      config={{
                        browser: settings.browser,
                        device: settings.device,
                        os: settings.os,
                        viewport: settings.viewport,
                        onTestFailure: settings.onTestFailure || "triage_only"
                      }}
                      onConfigChange={(config) => setSettings({
                        browser: config.browser,
                        device: config.device,
                        os: config.os,
                        viewport: config.viewport,
                        onTestFailure: config.onTestFailure || "triage_only"
                      })}
                      title="Suite Configuration"
                      className=""
                    />

                    <div className="flex justify-end">
                      <RoleBasedButton
                        type="primary"
                        loading={settingsLoading}
                        onClick={handleSettingsSave}
                        className="font-hanken !bg-[#AE00FF] !text-white !border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
                        data-testid="settings-save-button"
                      >
                        Save
                      </RoleBasedButton>
                    </div>

                    {/* Notification Settings Section */}
                    <div className="bg-white rounded-lg px-0 py-3">
                      <div className="flex items-center gap-2 mb-4">
                        <MailOutlined className="text-[#AE00FF]" />
                        <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Add email addresses to receive notifications about test results and suite runs.
                      </p>

                      {/* Add Email Input */}
                      <div className="flex gap-2 mb-4">
                        <Input
                          placeholder="Enter email address"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          onPressEnter={addEmailRecipient}
                          className="flex-1"
                          data-testid="email-input"
                        />
                        <RoleBasedButton
                          type="primary"
                          loading={isAddingEmail}
                          onClick={addEmailRecipient}
                          className="font-hanken !bg-[#AE00FF] !border-[#AE00FF] !text-white hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
                          data-testid="add-email-button"
                        >
                          Add Email
                        </RoleBasedButton>
                      </div>

                      {/* Email Recipients Table */}
                      <div className="border border-gray-200 rounded-lg">
                        <Table
                          dataSource={emailRecipients.map((email, index) => ({
                            key: `email-${index}-${email}`,
                            email: email,
                          }))}
                          rowKey="key"
                          data-testid="email-recipients-table"
                          columns={[
                            {
                              title: 'Email Address',
                              dataIndex: 'email',
                              key: 'email',
                              render: (email: string) => (
                                <span className="text-gray-900">{email}</span>
                              ),
                            },
                            {
                              title: 'Actions',
                              key: 'actions',
                              width: 100,
                              render: (_, record) => (
                                <Tooltip title="Delete email">
                                  <RoleBasedButton
                                    type="text"
                                    danger
                                    icon={deletingEmail === record.email ? <Spin size="small" /> : <DeleteOutlined />}
                                    onClick={() => removeEmailRecipient(record.email)}
                                    className="hover:bg-red-50"
                                    loading={deletingEmail === record.email}
                                    disabled={deletingEmail === record.email}
                                    data-testid={`delete-email-${record.email}`}
                                  />
                                </Tooltip>
                              ),
                            },
                          ]}
                          loading={emailRecipientsLoading}
                          pagination={false}
                          locale={{
                            emptyText: 'No email recipients added yet'
                          }}
                        />
                      </div>
                    </div>


                  </div>
                ),
              },
              {
                key: String(TAB.SEGMENTS),
                label: "Segments",
                children: (
                  <div className="w-full">

                    <Table
                      className="font-hanken"
                      size="small"
                      columns={segmentsColumns}
                      dataSource={segments}
                      rowKey={(record) => record?.segment_id ?? record?.segment_name ?? ''}
                      pagination={false}
                      loading={segmentsLoading}
                    />
                  </div>
                ),
              },
              {
                key: String(TAB.PLAN),
                label: "Plan",
                children: (
                  <div className="flex flex-col gap-6 w-full max-w-4xl">
                    {generatedTests.length === 0 ? (
                      <div className="bg-white rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Test Plan</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Describe your feature and we&apos;ll generate a test plan for you.
                        </p>

                        <div className="flex flex-col gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Feature Description
                            </label>
                            <Input.TextArea
                              placeholder="Describe the feature you want to test."
                              value={planDescription}
                              onChange={(e) => setPlanDescription(e.target.value)}
                              rows={4}
                              className="font-hanken"
                            />
                          </div>

                          <div className="flex justify-end">
                            <RoleBasedButton
                              type="primary"

                              loading={planLoading}
                              onClick={handleGenerateTestPlans}
                              className="font-hanken !bg-[#AE00FF] !text-white !border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
                            >
                              Generate Test Plan
                            </RoleBasedButton>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Generated Test Plans</h3>
                          <div className="flex gap-2">
                            <RoleBasedButton
                              onClick={() => {
                                setGeneratedTests([]);
                                setDiscardedTests(new Set());
                                setPlanDescription("");
                              }}
                              className="font-hanken text-[14px] !border-2 !border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
                            >
                              Start Over
                            </RoleBasedButton>
                            <RoleBasedButton
                              type="primary"

                              loading={bulkCreateLoading}
                              onClick={handleBulkCreateTests}
                              className="font-hanken !bg-[#AE00FF] !text-white !border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
                            >
                              Save
                            </RoleBasedButton>
                          </div>
                        </div>
                        <div className="my-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <strong>{generatedTests.filter((_, index) => !discardedTests.has(index)).length}</strong> of <strong>{generatedTests.length}</strong> tests will be created.
                          </p>
                        </div>

                        <div className="space-y-4">
                          {generatedTests.map((test, index) => {
                            const isDiscarded = discardedTests.has(index);
                            return (
                              <div
                                key={index}
                                className={`border rounded-lg p-4 transition-all duration-200 ${isDiscarded
                                  ? 'border-red-200 bg-red-50 opacity-60'
                                  : 'border-gray-200 bg-white'
                                  }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 mb-2">{test.name}</h4>
                                    <p className="text-sm text-gray-600">{test.description}</p>
                                  </div>
                                  <div className="ml-4">
                                    {isDiscarded ? (
                                      <RoleBasedButton

                                        onClick={() => handleUndiscardTest(index)}
                                        className="font-hanken text-[12px] !border-2 !border-green-500 !text-green-600 rounded-[6px] hover:!border-green-600 hover:!bg-green-50"
                                      >
                                        Restore
                                      </RoleBasedButton>
                                    ) : (
                                      <RoleBasedButton

                                        onClick={() => handleDiscardTest(index)}
                                        className="font-hanken text-[12px] !border-2 !border-red-500 !text-red-600 rounded-[6px] hover:!border-red-600 hover:!bg-red-50"
                                      >
                                        Discard
                                      </RoleBasedButton>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <strong>{generatedTests.filter((_, index) => !discardedTests.has(index)).length}</strong> of <strong>{generatedTests.length}</strong> tests will be created.
                          </p>
                        </div>
                        <div className="flex justify-end mt-4">
                          <RoleBasedButton
                            type="primary"

                            loading={bulkCreateLoading}
                            onClick={handleBulkCreateTests}
                            className="font-hanken !bg-[#AE00FF] !text-white !border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
                          >
                            Save
                          </RoleBasedButton>
                        </div>


                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: String(TAB.ELEMENTS),
                label: "Elements",
                children: (
                  <div className="w-full">
                    {isMergeMode && (
                      <div className="mb-4 p-4 bg-purple-50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <p className="font-hanken text-sm">
                            <strong>Merge Mode:</strong> Select elements to merge into the primary element
                          </p>
                          <p className="font-hanken text-xs text-gray-600">
                            ({selectedElementsForMerge.length} selected)
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleCancelMerge}
                            className="font-hanken text-[14px]"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="primary"
                            onClick={handleMergeElements}
                            loading={mergeLoading}
                            disabled={selectedElementsForMerge.length === 0}
                            className="font-hanken text-[14px] !text-white !bg-[#AE00FF] !border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
                          >
                            Merge ({selectedElementsForMerge.length})
                          </Button>
                        </div>
                      </div>
                    )}
                    <Table
                      className="font-hanken"
                      columns={elementsColumns}
                      dataSource={elements}
                      rowKey="element_id"
                      loading={elementsLoading}
                      pagination={false}
                      data-testid="suite-elements-table"
                    />
                  </div>
                ),
              },
            ]}
          />
          {currTab === TAB.SCHEDULES && (
            <div className="flex justify-end absolute right-12">
              <RoleBasedButton
                type="primary"
                size="large"
                onClick={handleCreateSchedule}
                className="font-hanken !bg-white text-[14px] !text-black border-2 !border-[#DD94FF] rounded-[6px] hover:!border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF]"
              >
                Add schedule
              </RoleBasedButton>
            </div>
          )}
        </div>

        <DeleteConfirmation
          id={deleteTestId}
          handleCancel={() => setOpenModal(false)}
          titleText={modalTitle}
          open={openModal}
          confirmationText={`Are you sure you want to delete ${testName}?`}
          handleDelete={deleteTest}
          loading={deleteLoading}
        />

        {/* Create Schedule Modal */}
        <Modal
          title="Add schedule"
          open={isCreateScheduleModalOpen}
          onCancel={() => {
            setIsCreateScheduleModalOpen(false);
            setScheduleEnvironmentId("no-environment");
            setSelectedScheduleTags([]);
            setScheduleTagCondition("no_filter");
            setScheduleConfigTab("schedule");
          }}
          data-testid="suite-create-schedule-modal"
          footer={[
            <Button
              key="cancel"
              className="font-hanken text-[14px] border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
              onClick={() => {
                setIsCreateScheduleModalOpen(false);
                setScheduleEnvironmentId("no-environment");
                setSelectedScheduleTags([]);
                setScheduleTagCondition("contains_any");
                setScheduleConfigTab("schedule");
              }}
              data-testid="create-schedule-cancel-button"
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleScheduleSubmit}
              className="font-hanken text-[14px] border-2"
              data-testid="create-schedule-submit-button"
            >
              Add
            </Button>,
          ]}
        >
          <div className="flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-hanken text-sm ${scheduleConfigTab === "schedule"
                  ? "border-b-2 border-[#AE00FF] text-[#AE00FF]"
                  : "text-gray-500"
                  }`}
                onClick={() => setScheduleConfigTab("schedule")}
                data-testid="schedule-config-tab"
              >
                Schedule
              </button>
              <button
                className={`px-4 py-2 font-hanken text-sm ${scheduleConfigTab === "config"
                  ? "border-b-2 border-[#AE00FF] text-[#AE00FF]"
                  : "text-gray-500"
                  }`}
                onClick={() => setScheduleConfigTab("config")}
                data-testid="config-tab"
              >
                Config
              </button>
              <button
                className={`px-4 py-2 font-hanken text-sm ${scheduleConfigTab === "tags"
                  ? "border-b-2 border-[#AE00FF] text-[#AE00FF]"
                  : "text-gray-500"
                  }`}
                onClick={() => setScheduleConfigTab("tags")}
                data-testid="tags-tab"
              >
                Tags
              </button>
            </div>

            {/* Schedule Tab */}
            {scheduleConfigTab === "schedule" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-hanken">Schedule Type</label>
                  <Radio.Group
                    value={scheduleType}
                    onChange={(e: any) =>
                      setScheduleType(e.target.value as "hourly" | "daily")
                    }
                    data-testid="schedule-type-radio-group"
                  >
                    <Radio.Button value="hourly" className="font-hanken" data-testid="schedule-type-hourly">
                      <ClockCircleOutlined /> Set by Hours
                    </Radio.Button>
                    <Radio.Button value="daily" className="font-hanken" data-testid="schedule-type-daily">
                      <CalendarOutlined /> Set by Days
                    </Radio.Button>
                  </Radio.Group>
                </div>
                {scheduleType === "hourly" ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-hanken">Run tests every</label>
                    <div className="flex items-center gap-2">
                      <InputNumber
                        min={1}
                        max={24}
                        value={hourlyInterval}
                        onChange={(value: number | null) =>
                          setHourlyInterval(value || 1)
                        }
                        className="w-24"
                      />
                      <span className="font-hanken">hours</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-hanken">Start Time:</span>
                      <span className="font-hanken">{currentTime}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="font-hanken">Run tests every</label>
                    <div className="flex items-center gap-2">
                      <InputNumber
                        min={1}
                        max={30}
                        value={hourlyInterval}
                        onChange={(value: number | null) =>
                          setHourlyInterval(value || 1)
                        }
                        className="w-24"
                      />
                      <span className="font-hanken">days</span>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <label className="font-hanken">Start Time (GMT)</label>
                      <DatePicker
                        showTime={{
                          showNow: false,
                          defaultValue: selectedSchedule?.type === 'daily' ? dayjs.utc(selectedSchedule?.startTime) : dayjs.utc()
                        }}
                        format="YYYY-MM-DD HH:mm"
                        value={scheduleTime}
                        onChange={setScheduleTime}
                        disabledDate={(current: dayjs.Dayjs) => {
                          return current && current < dayjs().subtract(1, 'day').startOf('day');
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {/* Environment Selection */}
                <div className="flex flex-col gap-2 mt-4">
                  <label className="font-hanken">Environment</label>
                  <Select
                    placeholder={environmentsLoading ? "Loading environments..." : "Select environment"}
                    value={scheduleEnvironmentId}
                    onChange={setScheduleEnvironmentId}
                    allowClear
                    className="w-full"
                    loading={environmentsLoading}
                    notFoundContent={
                      environmentsLoading ? (
                        <div className="text-center py-2">
                          <Spin size="small" />
                          <div className="mt-1">Loading environments...</div>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <div>No environments found</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Create an environment in the Environments tab first
                          </div>
                        </div>
                      )
                    }
                  >
                    <Select.Option key="no-environment" value="no-environment">
                      No environment
                    </Select.Option>
                    {environments.map((env) => (
                      <Select.Option key={env.environment_id} value={env.environment_id}>
                        {env.environment_name}
                      </Select.Option>
                    ))}
                  </Select>
                  <p className="text-xs text-gray-500 font-hanken">
                    Select an environment for this schedule
                  </p>
                </div>
              </div>
            )}

            {/* Config Tab */}
            {scheduleConfigTab === "config" && (
              <Config
                config={scheduleConfig}
                onConfigChange={setScheduleConfig}
                title=""
                className=""
              />
            )}

            {/* Tags Tab */}
            {scheduleConfigTab === "tags" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-hanken text-sm">Condition</label>
                  <Select
                    value={scheduleTagCondition}
                    onChange={(value) => setScheduleTagCondition(value)}
                    className="w-full"
                  >
                    <Select.Option value="no_filter">No filters</Select.Option>
                    <Select.Option value="contains_any">Contains Any</Select.Option>
                    <Select.Option value="does_not_contain_any">Does Not Contain Any</Select.Option>
                  </Select>
                </div>
                {scheduleTagCondition !== "no_filter" && (
                  <div className="flex flex-col gap-2">
                    <label className="font-hanken text-sm">Select Tags</label>
                    {tagsLoading ? (
                      <div className="flex justify-center py-4">
                        <Spin />
                      </div>
                    ) : masterTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-2">
                        {masterTags.map((tag: string, index: number) => (
                          <Checkbox
                            key={index}
                            checked={selectedScheduleTags.includes(tag)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedScheduleTags([...selectedScheduleTags, tag]);
                              } else {
                                setSelectedScheduleTags(selectedScheduleTags.filter((t) => t !== tag));
                              }
                            }}
                            className="font-hanken"
                          >
                            {tag}
                          </Checkbox>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 font-hanken py-4">
                        No tags available
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>

        {/* View Schedule Modal */}
        <Modal
          title="Schedule Details"
          open={isViewScheduleModalOpen}
          onCancel={() => {
            setIsViewScheduleModalOpen(false);
            setEditScheduleConfigTab("schedule");
            setEditScheduleConfig({
              browser: "chrome",
              device: "desktop",
              os: "windows",
              viewport: "1920x1080"
            });
            setScheduleEnvironmentId("no-environment");
            setSelectedEditScheduleTags([]);
            setEditScheduleTagCondition("no_filter");
          }}
          data-testid="suite-view-schedule-modal"
          footer={[
            <Button
              key="cancel"
              className="font-hanken text-[14px] border-2 mr-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
              onClick={() => {
                setIsViewScheduleModalOpen(false);
                setEditScheduleConfigTab("schedule");
                setEditScheduleConfig({
                  browser: "chrome",
                  device: "desktop",
                  os: "windows",
                  viewport: "1920x1080"
                });
                setScheduleEnvironmentId("no-environment");
                setSelectedEditScheduleTags([]);
                setEditScheduleTagCondition("no_filter");
              }}
              data-testid="view-schedule-cancel-button"
            >
              Cancel
            </Button>,
            <RoleBasedButton
              key="update"
              type="primary"
              onClick={handleUpdateSchedule}
              loading={isUpdating}
              className="font-hanken !text-[14px] border-2 !bg-[#AE00FF] !text-white !border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
              data-testid="view-schedule-update-button"
            >
              Update
            </RoleBasedButton>,
          ]}
        >
          <div className="flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-hanken text-sm ${editScheduleConfigTab === "schedule"
                  ? "border-b-2 border-[#AE00FF] text-[#AE00FF]"
                  : "text-gray-500"
                  }`}
                onClick={() => setEditScheduleConfigTab("schedule")}
              >
                Schedule
              </button>
              <button
                className={`px-4 py-2 font-hanken text-sm ${editScheduleConfigTab === "config"
                  ? "border-b-2 border-[#AE00FF] text-[#AE00FF]"
                  : "text-gray-500"
                  }`}
                onClick={() => setEditScheduleConfigTab("config")}
              >
                Config
              </button>
              <button
                className={`px-4 py-2 font-hanken text-sm ${editScheduleConfigTab === "tags"
                  ? "border-b-2 border-[#AE00FF] text-[#AE00FF]"
                  : "text-gray-500"
                  }`}
                onClick={() => setEditScheduleConfigTab("tags")}
                data-testid="edit-schedule-tags-tab"
              >
                Tags
              </button>
            </div>

            {/* Schedule Tab */}
            {editScheduleConfigTab === "schedule" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-hanken">Schedule Type</label>
                  <Radio.Group
                    value={scheduleType}
                    onChange={(e: any) =>
                      setScheduleType(e.target.value as "hourly" | "daily")
                    }
                  >
                    <Radio.Button value="hourly" className="font-hanken">
                      <ClockCircleOutlined /> Set by Hours
                    </Radio.Button>
                    <Radio.Button value="daily" className="font-hanken">
                      <CalendarOutlined /> Set by Days
                    </Radio.Button>
                  </Radio.Group>
                </div>

                {scheduleType === "hourly" ? (
                  <div className="flex flex-col gap-2">
                    <label className="font-hanken">Run tests every</label>
                    <div className="flex items-center gap-2">
                      <InputNumber
                        min={1}
                        max={24}
                        value={hourlyInterval}
                        onChange={(value: number | null) =>
                          setHourlyInterval(value || 1)
                        }
                        className="w-24"
                      />
                      <span className="font-hanken">hours</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-hanken">Start Time (GMT):</span>
                      <span className="font-hanken">{currentTime}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="font-hanken">Run tests every</label>
                    <div className="flex items-center gap-2">
                      <InputNumber
                        min={1}
                        max={30}
                        value={hourlyInterval}
                        onChange={(value: number | null) =>
                          setHourlyInterval(value || 1)
                        }
                        className="w-24"
                      />
                      <span className="font-hanken">days</span>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <label className="font-hanken">Start Time (GMT)</label>
                      <DatePicker
                        showTime={{
                          showNow: false,
                          defaultValue: selectedSchedule?.type === 'daily' ? dayjs.utc(selectedSchedule?.startTime) : dayjs.utc()
                        }}
                        format="YYYY-MM-DD HH:mm"
                        value={scheduleTime}
                        onChange={setScheduleTime}
                        disabledDate={(current: dayjs.Dayjs) => {
                          return current && current < dayjs().subtract(1, 'day').startOf('day');
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {/* Environment Selection */}
                <div className="flex flex-col gap-2 mt-4">
                  <label className="font-hanken">Environment</label>
                  <Select
                    placeholder={environmentsLoading ? "Loading environments..." : "Select environment"}
                    value={scheduleEnvironmentId}
                    onChange={setScheduleEnvironmentId}
                    allowClear
                    className="w-full"
                    loading={environmentsLoading}
                    notFoundContent={
                      environmentsLoading ? (
                        <div className="text-center py-2">
                          <Spin size="small" />
                          <div className="mt-1">Loading environments...</div>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <div>No environments found</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Create an environment in the Environments tab first
                          </div>
                        </div>
                      )
                    }
                  >
                    <Select.Option key="no-environment" value="no-environment">
                      No environment
                    </Select.Option>
                    {environments.map((env) => (
                      <Select.Option key={env.environment_id} value={env.environment_id}>
                        {env.environment_name}
                      </Select.Option>
                    ))}
                  </Select>
                  <p className="text-xs text-gray-500 font-hanken">
                    Select an environment for this schedule
                  </p>
                </div>
              </div>
            )}

            {/* Config Tab */}
            {editScheduleConfigTab === "config" && (
              <Config
                config={editScheduleConfig}
                onConfigChange={setEditScheduleConfig}
                title=""
                className=""
              />
            )}

            {/* Tags Tab */}
            {editScheduleConfigTab === "tags" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-hanken text-sm">Condition</label>
                  <Select
                    value={editScheduleTagCondition}
                    onChange={(value) => setEditScheduleTagCondition(value)}
                    className="w-full"
                  >
                    <Select.Option value="no_filter">No filters</Select.Option>
                    <Select.Option value="contains_any">Contains Any</Select.Option>
                    <Select.Option value="does_not_contain_any">Does Not Contain Any</Select.Option>
                  </Select>
                </div>
                {editScheduleTagCondition !== "no_filter" && (
                  <div className="flex flex-col gap-2">
                    <label className="font-hanken text-sm">Select Tags</label>
                    {tagsLoading ? (
                      <div className="flex justify-center py-4">
                        <Spin />
                      </div>
                    ) : masterTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-2">
                        {masterTags.map((tag: string, index: number) => (
                          <Checkbox
                            key={index}
                            checked={selectedEditScheduleTags.includes(tag)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEditScheduleTags([...selectedEditScheduleTags, tag]);
                              } else {
                                setSelectedEditScheduleTags(selectedEditScheduleTags.filter((t) => t !== tag));
                              }
                            }}
                            className="font-hanken"
                          >
                            {tag}
                          </Checkbox>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 font-hanken py-4">
                        No tags available
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>

        <DeleteConfirmation
          id={scheduleToDelete?.id}
          handleCancel={() => setIsDeleteScheduleModalOpen(false)}
          titleText="Delete Schedule"
          open={isDeleteScheduleModalOpen}
          confirmationText={`Are you sure you want to delete this schedule?`}
          handleDelete={handleDeleteSchedule}
          loading={deleteLoading}
        />

        {/* View File Modal */}
        <Modal
          title="File Details"
          open={isViewFileModalOpen}
          onCancel={() => {
            setIsViewFileModalOpen(false);
            setSelectedFile(null);
          }}
          footer={[
            <Button
              key="close"
              className="font-hanken text-[14px] border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
              onClick={() => {
                setIsViewFileModalOpen(false);
                setSelectedFile(null);
              }}
            >
              Close
            </Button>,
          ]}
          width={600}
        >
          {selectedFile && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-hanken font-medium">File Name</label>
                <p className="font-hanken text-[14px]">{selectedFile.file_name}</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-hanken font-medium">File ID</label>
                <p className="font-hanken text-[14px]">{selectedFile.file_id}</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-hanken font-medium">Created At</label>
                <p className="font-hanken text-[14px]">{selectedFile.created_at}</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-hanken font-medium">Modified At</label>
                <p className="font-hanken text-[14px]">{selectedFile.modified_at}</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-hanken font-medium">File URL</label>
                <p className="font-hanken text-[14px] break-all">{selectedFile.file_url}</p>
              </div>
              {selectedFile.file_url && (
                <div className="flex flex-col gap-2">
                  <label className="font-hanken font-medium">Preview</label>
                  <div className="max-h-[300px] overflow-auto">
                    {selectedFile.file_name?.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? (
                      <Image
                        src={selectedFile.file_url}
                        alt={selectedFile.file_name}
                        style={{ maxWidth: '100%' }}
                      />
                    ) : (
                      <p className="font-hanken text-[14px] text-gray-500">
                        Preview not available for this file type
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Delete File Modal */}
        <DeleteConfirmation
          id={fileToDelete?.file_id}
          handleCancel={() => setIsDeleteFileModalOpen(false)}
          titleText="Delete File"
          open={isDeleteFileModalOpen}
          confirmationText={`Are you sure you want to delete "${fileToDelete?.file_name}"?`}
          handleDelete={handleDeleteFile}
          loading={deleteLoading}
        />

        {/* Duplicate Test Modal */}
        <Modal
          title="Duplicate Test"
          open={isDuplicateModalOpen}
          onCancel={() => {
            setIsDuplicateModalOpen(false);
            setSelectedTestToDuplicate(null);
            setSelectedTargetSuite("");
            setTargetSuiteType("current");
          }}
          footer={[
            <Button
              key="cancel"
              className="font-hanken text-[14px] border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
              onClick={() => {
                setIsDuplicateModalOpen(false);
                setSelectedTestToDuplicate(null);
                setSelectedTargetSuite("");
                setTargetSuiteType("current");
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleDuplicateSubmit}
              loading={duplicateLoading}
              className="font-hanken text-[14px] border-2"
            >
              Duplicate
            </Button>,
          ]}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-hanken">Select Target Suite</label>
              <Radio.Group
                value={targetSuiteType}
                onChange={(e) => setTargetSuiteType(e.target.value)}
                className="mb-2"
              >
                <Radio value="current" className="font-hanken">Current Suite</Radio>
                <Radio value="other" className="font-hanken">Other Suite</Radio>
              </Radio.Group>

              {targetSuiteType === "other" && (
                <Select
                  placeholder="Select a suite"
                  value={selectedTargetSuite}
                  onChange={setSelectedTargetSuite}
                  className="w-full"
                  loading={fetchingSuites}
                  notFoundContent={fetchingSuites ? <Spin size="small" /> : "No suites found"}
                >
                  {availableSuites?.map((suite: any) => (
                    <Select.Option key={suite.suite_id} value={suite.suite_id}>
                      {suite.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </div>
            <div className="text-sm text-gray-500">
              <p>This will create a copy of &quot;{selectedTestToDuplicate?.name}&quot; in the selected suite.</p>
            </div>
          </div>
        </Modal>

        {/* Tag Selection Modal */}
        <Modal
          title="Select Tags"
          open={isTagModalOpen}
          onCancel={() => {
            setIsTagModalOpen(false);
            setTagModalTestId(null);
            setSelectedTags([]);
            setNewTagInput("");
          }}
          footer={[
            <Button
              key="cancel"
              className="font-hanken text-[14px] border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
              onClick={() => {
                setIsTagModalOpen(false);
                setTagModalTestId(null);
                setSelectedTags([]);
                setNewTagInput("");
              }}
            >
              Cancel
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={handleSaveTags}
              className="font-hanken text-[14px] border-2 bg-[#AE00FF] border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
            >
              Save
            </Button>,
          ]}
          width={600}
        >
          <div className="flex flex-col gap-4">
            {/* Add New Tag Section */}
            <div className="flex flex-col gap-2">
              <label className="font-hanken font-medium">Add New Tag</label>
              <div className="flex gap-2">
                <Input
                  className="font-hanken"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onPressEnter={handleAddNewTagInModal}
                  placeholder="Enter tag name"
                />
                <Button
                  type="primary"
                  onClick={handleAddNewTagInModal}
                  className="font-hanken bg-[#AE00FF] border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
                >
                  ADD
                </Button>
              </div>
            </div>

            {/* Existing Tags Section */}
            <div className="flex flex-col gap-2">
              <label className="font-hanken font-medium">Select Tags</label>
              {tagModalLoading ? (
                <div className="flex justify-center py-4">
                  <Spin />
                </div>
              ) : availableTags.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-2">
                  {availableTags.map((tag: string, index: number) => (
                    <Checkbox
                      key={index}
                      checked={selectedTags.includes(tag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags([...selectedTags, tag]);
                        } else {
                          setSelectedTags(selectedTags.filter((t) => t !== tag));
                        }
                      }}
                      className="font-hanken"
                    >
                      {tag}
                    </Checkbox>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 font-hanken py-4">
                  No tags available. Add a new tag above.
                </div>
              )}
            </div>
          </div>
        </Modal>

        {/* Run Config Modal */}
        <Modal
          title="Run Suite with Custom Config"
          open={isRunConfigModalOpen}
          onCancel={() => {
            setIsRunConfigModalOpen(false);
            setRunConfigTab("config");
            setSelectedRunTags([]);
            setRunTagCondition("contains_any");
          }}
          footer={[
            <Button
              key="cancel"
              className="font-hanken text-[14px] border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
              onClick={() => {
                setIsRunConfigModalOpen(false);
                setRunConfigTab("config");
              }}
            >
              Cancel
            </Button>,
            <Button
              key="run"
              type="primary"
              onClick={() => handleRunSuite(runConfig)}
              loading={runSuiteLoading}
              className="font-hanken text-[14px] border-2 bg-[#AE00FF] border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
            >
              Run Suite
            </Button>,
          ]}
        >
          <div className="flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-hanken text-sm ${runConfigTab === "config"
                  ? "border-b-2 border-[#AE00FF] text-[#AE00FF]"
                  : "text-gray-500"
                  }`}
                onClick={() => setRunConfigTab("config")}
                data-testid="run-config-tab"
              >
                Config
              </button>
              <button
                className={`px-4 py-2 font-hanken text-sm ${runConfigTab === "tags"
                  ? "border-b-2 border-[#AE00FF] text-[#AE00FF]"
                  : "text-gray-500"
                  }`}
                onClick={() => setRunConfigTab("tags")}
                data-testid="run-tags-tab"
              >
                Tags
              </button>
            </div>

            {/* Config Tab */}
            {runConfigTab === "config" && (
              <Config
                config={runConfig}
                onConfigChange={setRunConfig}
                title=""
                className=""
              />
            )}

            {/* Tags Tab */}
            {runConfigTab === "tags" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-hanken text-sm">Condition</label>
                  <Select
                    value={runTagCondition}
                    onChange={(value) => setRunTagCondition(value)}
                    className="w-full"
                  >
                    <Select.Option value="no_filter">No filters</Select.Option>
                    <Select.Option value="contains_any">Contains Any</Select.Option>
                    <Select.Option value="does_not_contain_any">Does Not Contain Any</Select.Option>
                  </Select>
                </div>
                {runTagCondition !== "no_filter" && (
                  <div className="flex flex-col gap-2">
                    <label className="font-hanken text-sm">Select Tags</label>
                    {tagsLoading ? (
                      <div className="flex justify-center py-4">
                        <Spin />
                      </div>
                    ) : masterTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-2">
                        {masterTags.map((tag: string, index: number) => (
                          <Checkbox
                            key={index}
                            checked={selectedRunTags.includes(tag)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRunTags([...selectedRunTags, tag]);
                              } else {
                                setSelectedRunTags(selectedRunTags.filter((t) => t !== tag));
                              }
                            }}
                            className="font-hanken"
                          >
                            {tag}
                          </Checkbox>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 font-hanken py-4">
                        No tags available
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>

        {/* Update File Modal */}
        <Modal
          title="Update File"
          open={isUpdateFileModalOpen}
          onCancel={() => {
            setIsUpdateFileModalOpen(false);
            setFileToUpdate(null);
          }}
          footer={[
            <Button
              key="cancel"
              className="font-hanken text-[14px] border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
              onClick={() => {
                setIsUpdateFileModalOpen(false);
                setFileToUpdate(null);
              }}
            >
              Cancel
            </Button>,
          ]}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-hanken font-medium">Current File</label>
              <p className="font-hanken text-[14px]">{fileToUpdate?.file_name}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-hanken font-medium">Upload New File</label>
              <Upload
                beforeUpload={(file) => {
                  handleUpdateFile(file);
                  return false; // Prevent default upload behavior
                }}
                showUploadList={false}
                accept="*/*"
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<UploadOutlined />}
                  loading={updateFileLoading}
                  className="font-hanken shadow-[30%] bg-white text-[14px] text-black border-2 border-[#DD94FF] rounded-[6px] hover:!border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF]"
                >
                  Choose File
                </Button>
              </Upload>
            </div>
            <div className="text-sm text-gray-500">
              <p>This will replace the current file &quot;{fileToUpdate?.file_name}&quot; with the new file you select.</p>
            </div>
          </div>
        </Modal>

        {/* View Data File Modal */}
        <Modal
          title="Data File Details"
          open={isViewDataFileModalOpen}
          onCancel={() => {
            setIsViewDataFileModalOpen(false);
            setSelectedDataFile(null);
          }}
          data-testid="suite-view-data-file-modal"
          footer={[
            <Button
              key="close"
              className="font-hanken text-[14px] border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
              onClick={() => {
                setIsViewDataFileModalOpen(false);
                setSelectedDataFile(null);
              }}
              data-testid="view-data-file-close-button"
            >
              Close
            </Button>,
          ]}
          width={600}
        >
          {selectedDataFile && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-hanken font-medium">File Name</label>
                <p className="font-hanken text-[14px]">{selectedDataFile.file_name}</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-hanken font-medium">File ID</label>
                <p className="font-hanken text-[14px]">{selectedDataFile.file_id}</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-hanken font-medium">Created At</label>
                <p className="font-hanken text-[14px]">{selectedDataFile.created_at}</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-hanken font-medium">Modified At</label>
                <p className="font-hanken text-[14px]">{selectedDataFile.modified_at}</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-hanken font-medium">File URL</label>
                <p className="font-hanken text-[14px] break-all">{selectedDataFile.file_url}</p>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Data File Modal */}
        <DeleteConfirmation
          id={dataFileToDelete?.file_id}
          handleCancel={() => setIsDeleteDataFileModalOpen(false)}
          titleText="Delete Data File"
          open={isDeleteDataFileModalOpen}
          confirmationText={`Are you sure you want to delete "${dataFileToDelete?.file_name}"?`}
          handleDelete={handleDeleteDataFile}
          loading={deleteLoading}
        />

        {/* Update Data File Modal */}
        <Modal
          title="Update Data File"
          open={isUpdateDataFileModalOpen}
          onCancel={() => {
            setIsUpdateDataFileModalOpen(false);
            setDataFileToUpdate(null);
          }}
          footer={[
            <Button
              key="cancel"
              className="font-hanken text-[14px] border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
              onClick={() => {
                setIsUpdateDataFileModalOpen(false);
                setDataFileToUpdate(null);
              }}
            >
              Cancel
            </Button>,
          ]}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-hanken font-medium">Current File</label>
              <p className="font-hanken text-[14px]">{dataFileToUpdate?.file_name}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-hanken font-medium">Upload New CSV File</label>
              <Upload
                beforeUpload={(file) => {
                  // Check if file is CSV
                  if (!file.name.toLowerCase().endsWith('.csv')) {
                    messageApi.error('Only CSV files are allowed');
                    return false;
                  }
                  handleUpdateDataFile(file);
                  return false; // Prevent default upload behavior
                }}
                showUploadList={false}
                accept=".csv"
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<UploadOutlined />}
                  loading={updateDataFileLoading}
                  className="font-hanken shadow-[30%] bg-white text-[14px] text-black border-2 border-[#DD94FF] rounded-[6px] hover:!border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF]"
                >
                  Choose CSV File
                </Button>
              </Upload>
            </div>
            <div className="text-sm text-gray-500">
              <p>This will replace the current file &quot;{dataFileToUpdate?.file_name}&quot; with the new CSV file you select.</p>
            </div>
          </div>
        </Modal>


        {/* Delete Schedule Modal */}
        <DeleteConfirmation
          id={scheduleToDelete?.id}
          handleCancel={() => setIsDeleteScheduleModalOpen(false)}
          titleText="Delete Schedule"
          open={isDeleteScheduleModalOpen}
          confirmationText={`Are you sure you want to delete this schedule?`}
          handleDelete={handleDeleteSchedule}
          loading={deleteLoading}
        />

        {/* Delete Segment Modal */}
        <DeleteConfirmation
          id={segmentToDelete?.segment_id || ""}
          handleCancel={() => setIsDeleteSegmentModalOpen(false)}
          titleText="Delete Segment"
          open={isDeleteSegmentModalOpen}
          confirmationText={`Are you sure you want to delete this segment?`}
          handleDelete={handleDeleteSegment}
          loading={segmentLoading}
        />

        {/* View File Modal */}
        <Modal
          title="File Details"
          open={isViewFileModalOpen}
          onCancel={() => {
            setIsViewFileModalOpen(false);
            setSelectedFile(null);
          }}
          footer={[
            <Button
              key="close"
              className="font-hanken text-[14px] border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
              onClick={() => {
                setIsViewFileModalOpen(false);
                setSelectedFile(null);
              }}
            >
              Close
            </Button>,
          ]}
          width={600}
        >
          {selectedFile && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-hanken font-medium">File Name</label>
                <p className="font-hanken text-[14px]">{selectedFile.file_name}</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-hanken font-medium">File ID</label>
                <p className="font-hanken text-[14px]">{selectedFile.file_id}</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-hanken font-medium">Created At</label>
                <p className="font-hanken text-[14px]">{selectedFile.created_at}</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-hanken font-medium">Modified At</label>
                <p className="font-hanken text-[14px]">{selectedFile.modified_at}</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-hanken font-medium">File URL</label>
                <p className="font-hanken text-[14px] break-all">{selectedFile.file_url}</p>
              </div>
              {selectedFile.file_url && (
                <div className="flex flex-col gap-2">
                  <label className="font-hanken font-medium">Preview</label>
                  <div className="max-h-[300px] overflow-auto">
                    {selectedFile.file_name?.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? (
                      <Image
                        src={selectedFile.file_url}
                        alt={selectedFile.file_name}
                        style={{ maxWidth: '100%' }}
                      />
                    ) : (
                      <p className="font-hanken text-[14px] text-gray-500">
                        Preview not available for this file type
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Delete File Modal */}
        <DeleteConfirmation
          id={fileToDelete?.file_id}
          handleCancel={() => setIsDeleteFileModalOpen(false)}
          titleText="Delete File"
          open={isDeleteFileModalOpen}
          confirmationText={`Are you sure you want to delete "${fileToDelete?.file_name}"?`}
          handleDelete={handleDeleteFile}
          loading={deleteLoading}
        />

        {/* Update File Modal */}
        <Modal
          title="Update File"
          open={isUpdateFileModalOpen}
          onCancel={() => {
            setIsUpdateFileModalOpen(false);
            setFileToUpdate(null);
          }}
          footer={[
            <Button
              key="cancel"
              className="font-hanken text-[14px] border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
              onClick={() => {
                setIsUpdateFileModalOpen(false);
                setFileToUpdate(null);
              }}
            >
              Cancel
            </Button>,
          ]}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-hanken font-medium">Current File</label>
              <p className="font-hanken text-[14px]">{fileToUpdate?.file_name}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-hanken font-medium">Upload New File</label>
              <Upload
                beforeUpload={(file) => {
                  handleUpdateFile(file);
                  return false; // Prevent default upload behavior
                }}
                showUploadList={false}
                accept="*/*"
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<UploadOutlined />}
                  loading={updateFileLoading}
                  className="font-hanken shadow-[30%] bg-white text-[14px] text-black border-2 border-[#DD94FF] rounded-[6px] hover:!border-[#AE00FF] hover:!text-white hover:!bg-[#AE00FF]"
                >
                  Choose File
                </Button>
              </Upload>
            </div>
            <div className="text-sm text-gray-500">
              <p>This will replace the current file &quot;{fileToUpdate?.file_name}&quot; with the new file you select.</p>
            </div>
          </div>
        </Modal>

        {/* Duplicate Test Modal */}
        <Modal
          title="Duplicate Test"
          open={isDuplicateModalOpen}
          onCancel={() => {
            setIsDuplicateModalOpen(false);
            setSelectedTestToDuplicate(null);
            setSelectedTargetSuite("");
            setTargetSuiteType("current");
          }}
          footer={[
            <Button
              key="cancel"
              className="font-hanken text-[14px] border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
              onClick={() => {
                setIsDuplicateModalOpen(false);
                setSelectedTestToDuplicate(null);
                setSelectedTargetSuite("");
                setTargetSuiteType("current");
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleDuplicateSubmit}
              loading={duplicateLoading}
              className="font-hanken text-[14px] border-2"
            >
              Duplicate
            </Button>,
          ]}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-hanken">Select Target Suite</label>
              <Radio.Group
                value={targetSuiteType}
                onChange={(e) => setTargetSuiteType(e.target.value)}
                className="mb-2"
              >
                <Radio value="current" className="font-hanken">Current Suite</Radio>
                <Radio value="other" className="font-hanken">Other Suite</Radio>
              </Radio.Group>

              {targetSuiteType === "other" && (
                <Select
                  placeholder="Select a suite"
                  value={selectedTargetSuite}
                  onChange={setSelectedTargetSuite}
                  className="w-full"
                  loading={fetchingSuites}
                  notFoundContent={fetchingSuites ? <Spin size="small" /> : "No suites found"}
                >
                  {availableSuites?.map((suite: any) => (
                    <Select.Option key={suite.suite_id} value={suite.suite_id}>
                      {suite.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </div>
            <div className="text-sm text-gray-500">
              <p>This will create a copy of &quot;{selectedTestToDuplicate?.name}&quot; in the selected suite.</p>
            </div>
          </div>
        </Modal>

        {/* Run Config Modal */}
        <Modal
          title="Run Suite with Custom Config"
          open={isRunConfigModalOpen}
          onCancel={() => {
            setIsRunConfigModalOpen(false);
            setRunConfigTab("config");
            setSelectedRunTags([]);
            setRunTagCondition("contains_any");
          }}
          footer={[
            <Button
              key="cancel"
              className="font-hanken text-[14px] border-2 border-[#EA3962] rounded-[6px] hover:!border-[#EA3962] hover:!bg-white hover:!text-black"
              onClick={() => {
                setIsRunConfigModalOpen(false);
                setRunConfigTab("config");
              }}
            >
              Cancel
            </Button>,
            <Button
              key="run"
              type="primary"
              onClick={() => handleRunSuite(runConfig)}
              loading={runSuiteLoading}
              className="font-hanken text-[14px] border-2 bg-[#AE00FF] border-[#AE00FF] hover:!bg-[#7c00b3] hover:!border-[#7c00b3]"
            >
              Run Suite
            </Button>,
          ]}
        >
          <div className="flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-hanken text-sm ${runConfigTab === "config"
                  ? "border-b-2 border-[#AE00FF] text-[#AE00FF]"
                  : "text-gray-500"
                  }`}
                onClick={() => setRunConfigTab("config")}
                data-testid="run-config-tab"
              >
                Config
              </button>
              <button
                className={`px-4 py-2 font-hanken text-sm ${runConfigTab === "tags"
                  ? "border-b-2 border-[#AE00FF] text-[#AE00FF]"
                  : "text-gray-500"
                  }`}
                onClick={() => setRunConfigTab("tags")}
                data-testid="run-tags-tab"
              >
                Tags
              </button>
            </div>

            {/* Config Tab */}
            {runConfigTab === "config" && (
              <Config
                config={runConfig}
                onConfigChange={setRunConfig}
                title=""
                className=""
              />
            )}

            {/* Tags Tab */}
            {runConfigTab === "tags" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-hanken text-sm">Condition</label>
                  <Select
                    value={runTagCondition}
                    onChange={(value) => setRunTagCondition(value)}
                    className="w-full"
                  >
                    <Select.Option value="no_filter">No filters</Select.Option>
                    <Select.Option value="contains_any">Contains Any</Select.Option>
                    <Select.Option value="does_not_contain_any">Does Not Contain Any</Select.Option>
                  </Select>
                </div>
                {runTagCondition !== "no_filter" && (
                  <div className="flex flex-col gap-2">
                    <label className="font-hanken text-sm">Select Tags</label>
                    {tagsLoading ? (
                      <div className="flex justify-center py-4">
                        <Spin />
                      </div>
                    ) : masterTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-2">
                        {masterTags.map((tag: string, index: number) => (
                          <Checkbox
                            key={index}
                            checked={selectedRunTags.includes(tag)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRunTags([...selectedRunTags, tag]);
                              } else {
                                setSelectedRunTags(selectedRunTags.filter((t) => t !== tag));
                              }
                            }}
                            className="font-hanken"
                          >
                            {tag}
                          </Checkbox>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 font-hanken py-4">
                        No tags available
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>

        <Modal
          title="Element Selectors"
          open={showSelectorsModal}
          onCancel={() => setShowSelectorsModal(false)}
          centered
          width={600}
          footer={[
            <Button
              key="close"
              onClick={() => setShowSelectorsModal(false)}
              className="font-hanken text-[14px]"
            >
              Cancel
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={handleSaveSelector}
              loading={updateSelectorLoading}
              className="font-hanken text-[14px]"
            >
              Save
            </Button>
          ]}
        >
          <div className="mb-4 text-sm text-gray-600">
            View the selectors available for this element.
          </div>
          <div className="space-y-3">
            {selectedElementSelectors.length > 0 ? (
              selectedElementSelectors.map((selector, index) => (
                <div
                  key={index}
                  className="text-black w-full text-sm break-words flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-2 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <Radio
                          checked={selectedSelectorIndex === index}
                          onChange={() => setSelectedSelectorIndex(index)}
                        />
                        <div className='font-hanken'>
                          {selector.display}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 ml-6">
                    <div className="bg-[#4542CC0D] p-2 rounded text-xs font-mono overflow-x-auto">
                      <div className="text-gray-700">
                        {selector.method === 'page.getByRole'
                          ? `${selector.method}(${selector.selector})`
                          : `${selector.method}('${selector.selector}')`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No selectors found for this element
              </div>
            )}
          </div>
        </Modal>

        {/* Create Segment Modal */}
        <SegmentModal
          open={isCreateSegmentModalOpen}
          onClose={() => setIsCreateSegmentModalOpen(false)}
          mode="create"
          suiteId={suite_id}
          onSubmit={handleCreateSegment}
          loading={segmentLoading}
        />

        {/* Delete Element Modal */}
        <DeleteConfirmation
          id={deleteElementId}
          titleText="Delete Element"
          confirmationText="Are you sure you want to delete this element? This action cannot be undone."
          loading={deleteLoading}
          handleDelete={handleDeleteElementConfirm}
          handleCancel={() => setDeleteElementId("")}
          open={deleteElementId !== ""}
        />

        {/* Edit Element Modal */}
        <Modal
          title="Edit Element"
          open={showEditElementModal}
          onCancel={() => {
            setShowEditElementModal(false);
            setSelectedElementForEdit(null);
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setShowEditElementModal(false);
                setSelectedElementForEdit(null);
              }}
              className="font-hanken text-[14px]"
            >
              Cancel
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={handleSaveElement}
              loading={updateElementLoading}
              className="font-hanken text-[14px]"
            >
              Save
            </Button>,
          ]}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prompt</label>
              <Input
                placeholder="Enter element prompt"
                value={selectedElementForEdit?.element_prompt || ''}
                onChange={(e) => {
                  if (selectedElementForEdit) {
                    setSelectedElementForEdit({
                      ...selectedElementForEdit,
                      element_prompt: e.target.value
                    });
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input.TextArea
                placeholder="Enter element description"
                value={selectedElementForEdit?.element_description || ''}
                onChange={(e) => {
                  if (selectedElementForEdit) {
                    setSelectedElementForEdit({
                      ...selectedElementForEdit,
                      element_description: e.target.value
                    });
                  }
                }}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Store (Optional)</label>
              <Select
                placeholder="Select a component or create new"
                value={selectedElementForEdit?.store_name || undefined}
                onChange={(value) => {
                  if (selectedElementForEdit) {
                    setSelectedElementForEdit({
                      ...selectedElementForEdit,
                      store_name: value
                    });
                  }
                }}
                className="w-full"
                loading={storesLoading}
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <div className="border-t border-gray-200 p-2">
                      <Button
                        type="text"
                        size="small"
                        onClick={() => setShowCreateStoreModal(true)}
                        className="w-full text-left font-hanken text-[#AE00FF] hover:!text-[#AE00FF]"
                        icon={<PlusOutlined />}
                      >
                        Create New Store
                      </Button>
                    </div>
                  </div>
                )}
                optionRender={(option) => {
                  const store = stores.find(s => s.store_name === option.value);
                  return (
                    <div className="flex flex-col">
                      <span className="font-medium">{store?.store_name}</span>
                      {store?.store_description && (
                        <span className="text-xs text-gray-500">{store.store_description}</span>
                      )}
                    </div>
                  );
                }}
              >
                {stores.map((store) => (
                  <Select.Option key={store.store_id} value={store.store_name}>
                    {store.store_name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </Modal>

        {/* Update Segment Modal */}
        <SegmentModal
          open={isUpdateSegmentModalOpen}
          onClose={() => {
            setIsUpdateSegmentModalOpen(false);
            setSelectedSegment(null);
          }}
          mode="update"
          initialForm={
            selectedSegment
              ? {
                  segment_name: selectedSegment.segment_name || "",
                  test_id: selectedSegment.test_id,
                  start_instruction_id: selectedSegment.start_instruction_id,
                  end_instruction_id: selectedSegment.end_instruction_id,
                }
              : undefined
          }
          suiteId={suite_id}
          onSubmit={handleUpdateSegment}
          loading={segmentLoading}
        />

        {/* Create Store Modal */}
        <CreateStoreModal
          open={showCreateStoreModal}
          onClose={() => setShowCreateStoreModal(false)}
          onCreateStore={handleCreateStore}
          loading={createStoreLoading}
        />

      </MaxWidthWrapper>
      {/* Share Suite Modal */}
      <SendInviteModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        orgId={currentUserDetails?.org_id || ""}
        resourceType="suite"
        resourceId={suite_id}
        resourceUrl={typeof window !== 'undefined' ? window.location.href : null}
        getToken={async () => {
          const token = await getToken({ template: "basic" });
          if (!token) {
            router.push("/sign-in");
          }
          return token;
        }}
        title="Share Suite"
      />
    </>
  );
}
