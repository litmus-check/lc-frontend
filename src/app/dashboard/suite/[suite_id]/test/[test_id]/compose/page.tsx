'use client';
import { useParams } from 'next/navigation';
import Compose from '@/components/Compose/Compose';

export default function ComposePage() {
  const params = useParams();
  const test_id = params?.test_id as string | undefined;
  const suite_id = params?.suite_id as string | undefined;

  return (
    <Compose params={{ test_id: test_id ?? null, suite_id: suite_id ?? null }} />
  );
}
