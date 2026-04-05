"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Form, Input, Typography, message } from "antd";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signupAPI } from "@/lib/apis/auth/auth";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/dashboard/suite";
  const { setSessionToken, refreshSession } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    email: string;
    password: string;
    confirm: string;
  }) => {
    if (values.password !== values.confirm) {
      message.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const response = await signupAPI(values.email.trim(), values.password);
      if (!response?.data?.accessToken) {
        message.error("Sign up failed");
        return;
      }
      setSessionToken(response.data.accessToken);
      await refreshSession();
      message.success("Account created");
      router.push(redirectPath);
    } catch (error: any) {
      message.error(error?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 p-6">
      <Typography.Title level={3} className="!mb-0 font-hanken">
        Sign up
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
          rules={[{ required: true, message: "Please enter a password" }]}
        >
          <Input.Password autoComplete="new-password" size="large" />
        </Form.Item>
        <Form.Item
          label="Confirm password"
          name="confirm"
          rules={[{ required: true, message: "Please confirm your password" }]}
        >
          <Input.Password autoComplete="new-password" size="large" />
        </Form.Item>
        <Form.Item className="!mb-2">
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            Create account
          </Button>
        </Form.Item>
      </Form>
      <Typography.Text type="secondary" className="font-hanken">
        Already have an account?{" "}
        <Link href={`/sign-in?redirect=${encodeURIComponent(redirectPath)}`}>
          Sign in
        </Link>
      </Typography.Text>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
