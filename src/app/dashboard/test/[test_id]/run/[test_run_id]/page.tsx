"use client";
import Header from "@/components/AgentHeader/Header";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Spin } from "antd";
import LogsComponent from "@/components/LogsComponent/LogsComponent";

export default function TestRunPage() {
  const params = useParams();
  const test_id = params?.test_id as string;
  const test_run_id = params?.test_run_id as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      setLoading(false);
  }, []);
  return loading ? (
    <div className="flex justify-center items-center h-screen">
      <Spin />
    </div>
  ) : (
    <>
    <Header />
    <div className="my-5 mx-12 overflow-x-hidden font-hanken">
        <h1 className="text-[28px] font-normal mb-5">Test Runs</h1>
        <p className="text-[14px] font-normal mb-3">Test ID: {test_id}</p>
        <p className="text-[14px] font-normal mb-3">Test Run ID: {test_run_id}</p>
        <LogsComponent
          type="test"
          id={test_id}
          testRunId={test_run_id}
        />
      
    </div>
    </>
  );
}
