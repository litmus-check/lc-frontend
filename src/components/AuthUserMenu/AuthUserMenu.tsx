"use client";

import { Button, Dropdown } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useUser as useAppUser } from "@/contexts/UserContext";

type AuthUserMenuProps = {
  /** light: dark text (marketing header). dark: light icon on purple bar */
  variant?: "light" | "dark";
};

export function AuthUserMenu({ variant = "dark" }: AuthUserMenuProps) {
  const { signOut } = useAuth();
  const { currentUserDetails } = useAppUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  const label = currentUserDetails?.email ?? "Account";

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: "email",
            label,
            disabled: true,
          },
          {
            key: "logout",
            label: "Sign out",
            onClick: () => void handleSignOut(),
          },
        ],
      }}
      trigger={["click"]}
    >
      <Button
        type="text"
        icon={<UserOutlined />}
        aria-label="Account menu"
        className={
          variant === "dark"
            ? "!text-white hover:!bg-white/10"
            : "!text-[#4542CC] hover:!bg-black/[0.04]"
        }
      />
    </Dropdown>
  );
}
