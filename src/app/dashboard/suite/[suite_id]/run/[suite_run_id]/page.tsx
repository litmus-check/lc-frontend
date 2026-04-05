"use client";
import SuiteRunLogs from "@/components/SuiteRunLogs/SuiteRunLogs";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Spin } from "antd";

export default function SuiteRunPage() {
  const params = useParams();
  const suite_id = params?.suite_id as string;
  const suite_run_id = params?.suite_run_id as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      setLoading(false);
  }, []);
  return loading ? (
    <div className="flex justify-center items-center h-screen">
      <Spin />
    </div>
  ) : (
    <SuiteRunLogs
      suiteId={suite_id}
      suiteRunId={suite_run_id}
      showHeader={true}
    />
  );
}