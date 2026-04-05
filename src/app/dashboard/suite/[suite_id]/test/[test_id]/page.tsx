"use client";
import { useParams } from "next/navigation";
import TestPageComponent from "@/components/TestPageComponent/TestPageComponent";

export default function TestComponent() {
  const params = useParams();
  const suite_id = params?.suite_id as string;
  const test_id = params?.test_id as string;

  return (
    <TestPageComponent test_id={test_id} suite_id={suite_id} showHeader={false} />
  );
}
