"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Form, Input, Typography, message } from "antd";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { loginAPI } from "@/lib/apis/auth/auth";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/dashboard/suite";
  const { setSessionToken, refreshSession } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await loginAPI(values.email.trim(), values.password);
      if (!response?.data?.accessToken) {
        message.error("Sign in failed");
        return;
      }
      setSessionToken(response.data.accessToken);
      await refreshSession();
      router.push(redirectPath);
    } catch (error: any) {
      message.error(error?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 p-6">
      <Typography.Title level={3} className="!mb-0 font-hanken">
        Sign in
      </Typography.Title>
      <Form
        layout="vertical"
        onFinish={onFinish}
        className="w-full max-w-sm"
        requiredMark={false}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input autoComplete="email" size="large" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password autoComplete="current-password" size="large" />
        </Form.Item>
        <Form.Item className="!mb-2">
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            Sign in
          </Button>
        </Form.Item>
      </Form>
      <Typography.Text type="secondary" className="font-hanken">
        No account?{" "}
        <Link href={`/sign-up?redirect=${encodeURIComponent(redirectPath)}`}>
          Sign up
        </Link>
      </Typography.Text>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
