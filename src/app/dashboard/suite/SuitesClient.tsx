"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/AgentHeader/Header";
import { Button, Input, Spin, message, Modal, Alert } from "antd";
import Link from "next/link";
import DeleteConfirmation from "@/components/DeleteConfirmation/DeleteConfirmation";
import { SearchOutlined } from "@ant-design/icons";
import { runSuiteAPI } from "@/lib/apis/testAI/test";
import "@/styles/globals.css";
import {
  deleteTestSuiteAPI,
  createTestSuiteAPI,
} from "@/lib/apis/testAI/test";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Compose from "@/components/Compose/Compose";
import { extractErrorMessage } from "@/lib/utils";
import { EnvironmentProvider } from "@/contexts/EnvironmentContext";
import { useUser } from "@/contexts/UserContext";
import { RoleBasedButton } from "@/components/ui/role-based-button";
import { useNavigationLoading } from "@/contexts/NavigationLoadingContext";

export interface SuiteItem {
  suite_id: string;
  name: string;
  total_tests?: number;
  total_envs?: number;
  total_schedules?: number;
}

/** API returns { items: [...] } (top-level items) */
export interface InitialSuitesShape {
  items?: SuiteItem[];
  data?: {
    items?: SuiteItem[];
    metadata?: {
      page_number: number;
      page_size: number;
      total_pages: number;
      total_records: number;
    };
  };
}

interface SuitesClientProps {
  initialSuites: InitialSuitesShape | null;
  initialError: string | null;
}

export default function SuitesClient({
  initialSuites,
  initialError,
}: SuitesClientProps) {
  const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { currentUserDetails, userLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useQuery({
    queryKey: ["token", isSignedIn],
    queryFn: async () => {
      const response = await getToken({ template: "basic" });
      return response;
    },
    enabled: isAuthLoaded && isSignedIn,
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "Suites - Litmus Check";
    }
  }, []);

  // Auth is enforced by middleware/server routes. Avoid client-side
  // redirects from transient or stale token-query states.

  const [testName, setTestName] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("New Test Suite");
  const [formFields, setFormFields] = useState({
    name: "",
    url: "",
  });
  const [formUrlError, setFormUrlError] = useState(false);

  const resetFormFields = () => {
    setFormFields({
      name: "",
      url: "",
    });
    setFormUrlError(false);
  };

  const [deleteTestId, setDeleteTestId] = useState<string>("");
  const [openMenuIdx, setOpenMenuIdx] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [navigatingToSuiteId, setNavigatingToSuiteId] = useState<string | null>(null);
  const setNavigationLoading = useNavigationLoading();

  // Check for compose query parameter
  useEffect(() => {
    if (searchParams) {
      const composeParam = searchParams.get("compose");
      if (composeParam === "true") {
        setShowCompose(true);
        const urlParam = searchParams.get("url");
        if (urlParam) {
          setUrlInput(decodeURIComponent(urlParam));
        }
      }
    }
  }, [searchParams]);

  const handleRunSuite = useMutation({
    mutationKey: ["runSuiteAPI"],
    mutationFn: (record: { key: string }) =>
      runSuiteAPI(token?.data ?? "", record.key),
    onSuccess: (response: any) => {
      messageApi.success(response?.data?.message);
    },
    onError: (error: any) => {
      messageApi.error(extractErrorMessage(error));
    },
  });

  const deleteSuite = useMutation({
    mutationKey: ["deleteSuiteAPI"],
    mutationFn: (testId: string) =>
      deleteTestSuiteAPI(token?.data ?? "", testId),
    onSuccess: () => {
      messageApi.success("Suite deleted successfully");
      setOpenDeleteModal(false);
      router.refresh();
    },
    onError: (error: any) => {
      messageApi.error(extractErrorMessage(error));
      setOpenDeleteModal(false);
    },
  });

  const handleDelete = (record: { name: string; key: string }) => {
    setTestName(record.name);
    setModalTitle("Delete Confirmation");
    setDeleteTestId(record.key);
    setOpenDeleteModal(true);
  };

  // API returns { items: [...] } — support that and { data: { items } } fallback
  const rawItems: SuiteItem[] | undefined =
    initialSuites?.items ?? initialSuites?.data?.items;
  const allData = Array.isArray(rawItems)
    ? rawItems.map((test) => ({
        key: test.suite_id,
        suite_id: test.suite_id,
        name: test.name,
        total_tests: test.total_tests ?? 0,
        environments: test.total_envs ?? 0,
        schedules: test.total_schedules ?? 0,
        test,
      }))
    : [];

  const data = searchQuery.trim()
    ? allData.filter((suite) => {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = suite.name.toLowerCase().includes(query);
        const idMatch = suite.suite_id.toLowerCase().includes(query);
        return nameMatch || idMatch;
      })
    : allData;

  const createTestSuite = useMutation({
    mutationKey: ["createTestSuiteAPI"],
    mutationFn: () =>
      createTestSuiteAPI(token?.data ?? "", {
        name: formFields.name,
        sign_in_url: formFields.url.trim(),
        config: {
          browser: "chrome",
          device: {
            type: "desktop",
            device_config: {
              os: "windows",
            },
          },
          viewport: {
            width: 1920,
            height: 1080,
          },
        },
        mode: "blank",
      }),
    onSuccess: (response: any) => {
      messageApi.success("Suite created successfully");
      setOpenModal(false);
      const suiteId = response.data?.suite_id || response.data?.id;
      resetFormFields();
      router.refresh();
      if (suiteId) {
        const urlToUse = formFields.url.trim();
        const encodedUrl = encodeURIComponent(urlToUse);
        router.push(`/dashboard/suite/${suiteId}?url=${encodedUrl}`);
      }
    },
    onError: (error: any) => {
      messageApi.error(extractErrorMessage(error));
    },
  });

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuIdx(null);
      }
    }
    if (openMenuIdx !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuIdx]);

  const isLoading = !isAuthLoaded || userLoading || token.isLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      {navigatingToSuiteId && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80"
          aria-label="Loading suite"
        >
          <Spin/>
        </div>
      )}
      <Header />
      {showCompose ? (
        <EnvironmentProvider>
          <Compose params={{ test_id: null, suite_id: null }} />
        </EnvironmentProvider>
      ) : (
        <div className="flex w-full min-h-[calc(100vh-64px)] bg-[#F8F8FF]">
          <div className="flex-1 flex flex-col w-full bg-[#F8F8FF] p-6" data-testid="suites-main-content">
            {initialError && (
              <Alert
                type="error"
                message={initialError}
                className="mb-4"
                showIcon
              />
            )}
            <div className="flex items-center justify-between mb-6" data-testid="suites-header">
              <h2 className="font-hanken text-[20px] font-semibold" data-testid="suites-title">
                My Suites
              </h2>
              <RoleBasedButton
                className="!border-[#AE00FF] text-[14px] !bg-[#AE00FF] !text-white !rounded-md !px-5 !py-1"
                onClick={() => setOpenModal(true)}
                data-testid="suites-new-button"
              >
                New Suite
              </RoleBasedButton>
            </div>

            {allData.length > 0 && (
              <div className="mb-6" data-testid="suites-search">
                <Input
                  placeholder="Search by suite name or ID"
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="font-hanken max-w-md"
                  allowClear
                  data-testid="suites-search-input"
                />
              </div>
            )}

            {allData.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center" data-testid="suites-empty-state">
                <Image
                  src="/assets/blank_test_page.svg"
                  alt="No suites"
                  width={180}
                  height={180}
                  className="mb-4"
                />
                <div className="font-hanken text-[16px] font-normal mb-1">
                  Your saved test suites will appear here.{" "}
                  <span
                    className="text-[#AE00FF] cursor-pointer hover:underline"
                    onClick={() => setOpenModal(true)}
                  >
                    Create
                  </span>{" "}
                  a new one to get started.
                </div>
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center" data-testid="suites-no-results">
                <div className="font-hanken text-[16px] font-normal mb-1">
                  No suites found matching &quot;{searchQuery}&quot;
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="suites-grid">
                {data.map((suite, idx) => (
                  <Link
                    key={suite.key}
                    href={`suite/${suite.key}`}
                    className="relative bg-white rounded-lg border border-[#ECECEC] p-4 hover:border-[#DD94FF] transition-all duration-200 cursor-pointer block"
                    data-testid="suite-card"
                    onMouseLeave={() =>
                      openMenuIdx === idx && setOpenMenuIdx(null)
                    }
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (
                        target.closest("[data-suite-menu]") ||
                        target.closest("[data-suite-menu-button]")
                      ) {
                        e.preventDefault();
                      } else {
                        setNavigatingToSuiteId(suite.key);
                      }
                    }}
                  >
                    <div className="absolute top-3 right-3 z-10" data-suite-menu>
                      <Button
                        className="w-6 h-6 p-0 border border-[#DD94FF] rounded-md flex items-center justify-center bg-white hover:bg-[#F3EFFF] hover:border-[#DD94FF]"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setOpenMenuIdx(openMenuIdx === idx ? null : idx);
                        }}
                        tabIndex={-1}
                        data-testid="suite-menu-button"
                        data-suite-menu-button
                      >
                        <span className="text-[#AE00FF] text-xs font-medium leading-none">
                          ⋯
                        </span>
                      </Button>
                      {openMenuIdx === idx && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-8 p-1 z-20 bg-white border border-[#ECECEC] rounded-md shadow-md flex flex-col min-w-[100px]"
                          data-testid="suite-menu"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        >
                          <Button
                            className="py-2 flex items-center justify-start border-none shadow-none text-[#AE00FF] font-hanken"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setOpenMenuIdx(null);
                              handleRunSuite.mutate(suite);
                            }}
                            data-testid="suite-run-button"
                          >
                            Run
                          </Button>
                          <div className="border-t border-[#ECECEC] my-1"></div>
                          <RoleBasedButton
                            type="text"
                            className="py-2 flex items-center justify-start w-full border-none !text-[#EA3962] font-hanken"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setOpenMenuIdx(null);
                              handleDelete(suite);
                            }}
                            data-testid="suite-delete-button"
                          >
                            Delete
                          </RoleBasedButton>
                        </div>
                      )}
                    </div>

                    <h3 className="font-hanken text-[16px] font-semibold mb-3 pr-8" data-testid="suite-name">
                      {suite.name}
                    </h3>

                    <div className="font-hanken text-[14px] font-normal text-[#686868] mb-4" data-testid="suite-details">
                      <span className="text-[#686868] font-normal">
                        {suite.total_tests}
                      </span>{" "}
                      tests,{" "}
                      <span className="text-[#686868] font-normal">
                        {suite.environments}
                      </span>{" "}
                      environments,{" "}
                      <span className="text-[#686868] font-normal">
                        {suite.schedules}
                      </span>{" "}
                      schedules
                    </div>

                    <div className="inline-block">
                      <Button className="!border-[#DD94FF] !text-[#AE00FF] hover:!bg-[#AE00FF] hover:!text-white hover:!border-[#AE00FF] font-hanken min-w-[120px]" data-testid="suite-view-button">
                        View
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          resetFormFields();
        }}
        title="New Test Suite"
        data-testid="suites-create-modal"
        footer={[
          <Button
            key="create"
            type="primary"
            onClick={() => {
              if (!formFields.url.trim()) {
                setFormUrlError(true);
                return;
              }
              const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
              if (!urlPattern.test(formFields.url.trim())) {
                setFormUrlError(true);
                return;
              }
              setFormUrlError(false);
              setNavigationLoading?.(true);
              createTestSuite.mutate();
            }}
            loading={createTestSuite.isPending}
            data-testid="suites-create-button"
          >
            Create
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-4" data-testid="suites-create-form">
          <div className="flex flex-col gap-1">
            <label className="font-hanken text-sm">Name</label>
            <Input
              placeholder="Enter suite name"
              value={formFields.name}
              onChange={(e) =>
                setFormFields({ ...formFields, name: e.target.value })
              }
              data-testid="suites-name-input"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-hanken text-sm">URL</label>
            <Input
              placeholder="Enter URL"
              value={formFields.url}
              onChange={(e) => {
                setFormFields({ ...formFields, url: e.target.value });
                if (formUrlError) setFormUrlError(false);
              }}
              status={formUrlError ? "error" : ""}
              data-testid="suites-url-input"
            />
            {formUrlError && (
              <p className="text-[#EA3962] text-sm font-hanken" data-testid="suites-url-error">
                {formFields.url.trim()
                  ? "Please enter a valid URL"
                  : "Please enter a URL"}
              </p>
            )}
          </div>
        </div>
      </Modal>

      <DeleteConfirmation
        id={deleteTestId}
        handleCancel={() => setOpenDeleteModal(false)}
        titleText={modalTitle}
        open={openDeleteModal}
        confirmationText={`Are you sure you want to delete ${testName}?`}
        handleDelete={(suiteId: string) =>
          deleteSuite.mutate(String(suiteId))
        }
        loading={deleteSuite.isPending}
      />
    </>
  );
}
