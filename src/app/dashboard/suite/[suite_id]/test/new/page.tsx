"use client";

import TestPageComponent from "@/components/TestPageComponent/TestPageComponent";
import { useParams, useSearchParams } from "next/navigation";
import {useEffect} from "react";

export default function NewTestComponent() {
  const { suite_id } = useParams<{ suite_id: string }>();
  const suite_idStr = suite_id ?? "";
  const searchParams = useSearchParams();
  const duplicateFrom = searchParams?.get('duplicate_from');

  useEffect(() => {
    document.title = "New Test - Litmus Check";
  }, []);
  return (
    <TestPageComponent 
      suite_id={suite_idStr} 
      duplicate_from={duplicateFrom}
      showHeader={false}
    />
  );
}
