"use client";
import React from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Menu } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getProjectAPI, type Project } from "@/lib/apis/geology/projects";
import { useNavigationLoading } from "@/contexts/NavigationLoadingContext";
import "@/styles/globals.css";

interface GeologySidebarProps {
  children: React.ReactNode;
}

export default function GeologySidebar({ children }: GeologySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const setNavigationLoading = useNavigationLoading();

  // Get project ID from URL (routes are under /geology/projects/[project_id]/...)
  const projectId = params?.project_id as string | undefined;

  const token = useQuery({
    queryKey: ["token"],
    queryFn: async () => {
      const response = await getToken({ template: "basic" });
      return response;
    },
    enabled: isAuthLoaded,
  });

  // Fetch project details
  const getProject = useQuery<Project, Error>({
    queryKey: ["getProjectAPI", projectId],
    queryFn: async () => {
      const response = await getProjectAPI(token?.data ?? "", projectId!);
      return response.data;
    },
    enabled: !!token?.data && !!projectId && isAuthLoaded && isSignedIn,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });

  // Extract tab from URL pathname
  const getTabFromPathname = () => {
    if (!pathname) return 'analytics';

    // Check analytics first (includes overview, personas, locations, citations, traffic)
    if (pathname.includes('/analytics')) return 'analytics';

    // Check for nested routes (e.g., /geology/prompts/[id]/view)
    if (pathname.includes('/prompts/')) return 'prompts';
    if (pathname.includes('/personas/')) return 'personas';
    if (pathname.includes('/locations/')) return 'locations';
    if (pathname.includes('/brands/')) return 'brands';
    if (pathname.includes('/page-audit')) return 'page-audit';
    if (pathname.includes('/web-indexing')) return 'web-indexing';
    if (pathname.includes('/insights')) return 'insights';
    if (pathname.includes('/content')) return 'content';
    if (pathname.includes('/tasks')) return 'tasks';
    
    // Check for direct routes (e.g., /geology/prompts)
    const pathParts = pathname.split('/') || [];
    const tab = pathParts[pathParts.length - 1];
    const validTabs = ['analytics', 'prompts', 'personas', 'locations', 'brands', 'page-audit', 'web-indexing', 'insights', 'content', 'tasks'];
    return validTabs.includes(tab) ? tab : 'analytics';
  };

  const selectedTab = getTabFromPathname();

  const section1Items = [
    { key: "analytics", label: "Analytics" },
    { 
      key: "insights", 
      label: (
        <span className="flex items-center">
          Insights
          <span className="ml-2 px-1.5 py-0.5 text-xs text-gray-600 bg-gray-100 rounded">Beta</span>
        </span>
      ),
    },
  ];

  const section2Items = [
    { key: "prompts", label: "Prompts" },
    { key: "personas", label: "Personas" },
    { key: "locations", label: "Locations" },
    { key: "brands", label: "Brands" },
    { key: "tasks", label: "Tasks" },
    {key: "content", label: "Content"},
  ];

  const section3Items = [
    { key: "page-audit", label: "Page Audit" },
    { key: "web-indexing", label: "Web Indexing Audit" },
  ];

  const handleMenuSelect = (key: string) => {
    setNavigationLoading?.(true);
    router.push(projectId ? `/geology/projects/${projectId}/${key}` : `/geology/projects`);
  };


  return (
    <div className="flex w-full h-[calc(100vh-64px)] bg-[#F8F8FF]">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-[calc(100vh-64px)]">
        {getProject.data?.name && (
          <div className="px-5 py-3 border-b border-gray-200 flex items-center">
            <h3 className="font-hanken font-semibold text-[#4542CC] text-lg truncate" title={getProject.data.name}>
              {getProject.data.name}
            </h3>
          </div>
        )}
        <div className="flex-1 overflow-auto overflow-x-hidden geology-sidebar-menu bg-white min-w-full">
          <Menu
            mode="inline"
            selectedKeys={[selectedTab]}
            onSelect={({ key }) => handleMenuSelect(key)}
            className="border-r-0 font-hanken"
            items={section1Items}
          />
          <div className="border-t border-gray-200 my-2" />
          <Menu
            mode="inline"
            selectedKeys={[selectedTab]}
            onSelect={({ key }) => handleMenuSelect(key)}
            className="border-r-0 font-hanken"
            items={section2Items}
          />
          <div className="border-t border-gray-200 my-2" />
          <Menu
            mode="inline"
            selectedKeys={[selectedTab]}
            onSelect={({ key }) => handleMenuSelect(key)}
            className="border-r-0 font-hanken"
            items={section3Items}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children as any}
      </div>
    </div>
  );
}

