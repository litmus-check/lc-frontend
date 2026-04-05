"use client";
import React, { FC, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "@/components/MaxWidthWrapper/MaxWidthWrapper";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import { Button, Spin } from "antd";
import TalkToUs from "../TalktoUs/TalktoUs";
import { useRouter, usePathname } from "next/navigation";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import { useUser as useUserContext } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { AuthUserMenu } from "@/components/AuthUserMenu/AuthUserMenu";
import ArrowRightAltRoundedIcon from "@mui/icons-material/ArrowRightAltRounded";
import HeadphonesOutlinedIcon from "@mui/icons-material/HeadphonesOutlined";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { HomeOutlined } from "@ant-design/icons";

interface HeaderProps {
  minimal?: boolean;
}

const Header: FC<HeaderProps> = ({ minimal = false }) => {
  const { isSignedIn, getToken } = useAuth();
  const { currentUserDetails } = useUserContext();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [currentOrgDetailsLoading, setCurrentOrgDetailsLoading] =
    useState(false);
  const [currentOrgDetails, setCurrentOrgDetails] = useState<any>(null);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);

  useEffect(() => {
    // Calculate the height of the header element
    const headerElement = document.querySelector("header");
    if (headerElement) {
      setHeaderHeight(headerElement.clientHeight);
    }
  }, []);


  

  const toggleSidebar =
    (open: boolean, element = "") =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      if (element === "solution") {
        setSolutionOpen(open);
      } else if (element === "resource") {
        setResourceOpen(open);
      } else if (element === "products") {
        setProductsOpen(open);
      } else if (element === "credits") {
        setCreditsOpen(open);
      } else setSidebarOpen(open);
    };

  
  const email = "contact@finigami.com";
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(email)
      .then(() => {
        alert("Contact email copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <header
      style={{
        position: "sticky",
        top: "0px",
        maxHeight: "60px",
        zIndex: "20",
         backgroundColor: "white",
        // color: "#FFFFFF",
      }}
      data-testid="header"
    >
      <MaxWidthWrapper className="py-2 px-3.5 md:px-10">
        <nav className="flex justify-between font-hanken w-full">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              {isSignedIn && !minimal && (
                <Link
                  href="/dashboard/suite"
                  className="flex items-center gap-1 font-hanken text-[#4542CC] text-size-base p-0 h-auto font-semibold"
                  data-testid="header-logo-link"
                >
                  <Image
                    src="/assets/signedin-litmus.svg"
                    alt="LitmusCheck"
                    height={20}
                    width={20}
                    style={{ minWidth: "20px", minHeight: "20px", objectFit: "contain" }}
                    className="flex-shrink-0"
                  />
                  <span>LitmusCheck</span>
                </Link>
              )}
              {!isSignedIn && (
                <Link
                  
                  href="/"
                  data-testid="header-logo-link"
                  className="flex-shrink-0"
                >
                  <Image
                    src="/assets/litmus-new.svg"
                    alt="Litmus Logo"
                    width={140}
                    height={140}
                    style={{ minWidth: "100px", minHeight: "30px" }}
                    className="object-contain"
                  />
                </Link>
              )}
            </div>
            {isSignedIn && !minimal && (
              <Link 
                href="/dashboard/suite"
                data-testid="header-home-link"
              >
                <HomeOutlined className="text-[#4542CC] text-size-base" />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4" data-testid="header-nav">
            {/* Hamburger menu for mobile */}
            {/* <button
              className="md:hidden flex items-center"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon style={{ color: "#4542CC" }} fontSize="large" />
            </button> */}
            {/* Desktop links, hidden on mobile */}
            {!isSignedIn && (
              <div className="flex items-center gap-10" data-testid="header-guest-nav">
                <Link
                  href={"/dashboard/suite"}
                  className="max-md:text-sm whitespace-nowrap"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="font-hanken ">
                    Product
                  </span>
                </Link>
                <Link
                  href={"https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0bQNR6032ujwKV0oHVjnx2cp0iX8wXdJHFyivn98Yvqe9G3QoSTX9JqQ_CXMu2b0Kdw0ZRBvZv?gv=true"}
                  className="max-md:text-sm bg-[#4542CC] text-white px-5 py-1 rounded-md whitespace-nowrap"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="header-talk-to-us-link"
                >
                  <span className="font-hanken ">
                    Talk to us
                  </span>
                </Link>
              </div>
            )}

{isSignedIn && minimal && (
              <div className="flex items-center gap-10" data-testid="header-guest-nav">
                <Link
                  href={"/dashboard/suite"}
                  className="max-md:text-sm whitespace-nowrap"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="font-hanken ">
                    Product
                  </span>
                </Link>
                <Link
                  href={"https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0bQNR6032ujwKV0oHVjnx2cp0iX8wXdJHFyivn98Yvqe9G3QoSTX9JqQ_CXMu2b0Kdw0ZRBvZv?gv=true"}
                  className="max-md:text-sm bg-[#4542CC] text-white px-5 py-1 rounded-md whitespace-nowrap"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="header-talk-to-us-link"
                >
                  <span className="font-hanken ">
                    Talk to us
                  </span>
                </Link>
              </div>
            )}

            {isSignedIn && !minimal && (
              <div className="hidden lg:flex gap-10" data-testid="header-user-nav">
                <div className="flex items-center gap-10 mr-5">
                  {currentUserDetails?.role === "admin" && (
                    <Link href="/organizations" data-testid="header-orgs-link">
                      <span className="font-hanken text-[#4542CC] text-size-base">
                        Admin
                      </span>
                    </Link>
                  )}
                  <Link href="/settings" data-testid="header-settings-link">
                    <span className="font-hanken text-[#4542CC] text-size-base">
                      Settings
                    </span>
                  </Link>
                </div>
              </div>
            )}

            {isSignedIn && !minimal && (
              <div className="flex items-center" data-testid="header-user-button">
                <AuthUserMenu variant="light" />
              </div>
            )}
          </div>
        </nav>
      </MaxWidthWrapper>
      <Drawer
        sx={{ zIndex: 0 }}
        anchor="top"
        open={sidebarOpen}
        ModalProps={{
          BackdropProps: {
            style: {
              backgroundColor: "transparent",
            },
          },
        }}
        PaperProps={{
          sx: {
            top: `${headerHeight}px`,
            // Offset the drawer by the height of the header
            // Adjust the height of the drawer
          },
        }}
        onClose={toggleSidebar(false)}
        data-testid="header-mobile-drawer"
      >
        <List onClick={toggleSidebar(false)} onKeyDown={toggleSidebar(false)} data-testid="header-mobile-nav">
          {/* Mobile-only links for not signed in users */}
          {!isSignedIn && (
            <>
              <ListItem component={Link} href="/dashboard/suite">
                <div
                  className="group text-gray-500 relative flex items-center text-p-reg font-weight-p gap-5 rounded-md px-1 py-2 duration-300"
                >
                  Product
                </div>
              </ListItem>
              <ListItem component={Link} href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0bQNR6032ujwKV0oHVjnx2cp0iX8wXdJHFyivn98Yvqe9G3QoSTX9JqQ_CXMu2b0Kdw0ZRBvZv?gv=true">
                <div
                  className="group text-gray-500 relative w-full justify-center flex items-center gap-5 rounded-md px-1 py-2 text-p-reg font-weight-p font-hanken duration-300 bg-[#4542CC] text-white"
                  data-testid="header-mobile-talk-to-us"
                >
                  Talk to us
                </div>
              </ListItem>
            </>
          )}
          {isSignedIn && (
            <>
              {currentUserDetails?.role === "admin" && (
                <ListItem component={Link} href="/organizations">
                  <div
                    className="group text-gray-500
                   relative flex items-center text-p-reg font-weight-p gap-5 rounded-md px-1 py-2 duration-300"
                    data-testid="header-mobile-orgs"
                  >
                    Organizations
                  </div>
                </ListItem>
              )}
              <ListItem component={Link} href="/settings">
                <div
                  className="group text-gray-500
                   relative flex items-center text-p-reg font-weight-p gap-5 rounded-md px-1 py-2 duration-300"
                  data-testid="header-mobile-settings"
                >
                  Settings
                </div>
              </ListItem>
            </>
          )}
         
        </List>
      
      </Drawer>
      <Drawer
        anchor="top"
        open={creditsOpen}
        sx={{ zIndex: 0 }}
        ModalProps={{
          BackdropProps: {
            style: {
              backgroundColor: "transparent",
            },
          },
        }}
        PaperProps={{
          sx: {
            position: "absolute",
            backgroundColor: "#FFFAF2",
            borderRadius: "6px",
            top: "60px",
            width: "17%",
            left: "62.5%",
            transform: "translateX(-50%)",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "10px",
          },
        }}
        onClose={toggleSidebar(false, "credits")}
      >
        {currentOrgDetailsLoading ? (
          <div className="flex justify-center items-center">
            <Spin />
          </div>
        ) : (
          <div>
            <p className="flex gap-1 font-hanken font-medium">
              <span>You have</span>{" "}
              <Image
                src="/assets/credits-icon.svg"
                alt="Credits icon"
                height={12}
                width={12}
              />
              <span>{currentOrgDetails?.org_credits}</span>{" "}
            </p>
            <p className="font-hanken font-medium">
              To get more,{" "}
              <span
                className="text-[#FFA000] cursor-pointer"
                onClick={copyToClipboard}
              >
                contact us
              </span>
              .{" "}
            </p>
          </div>
        )}
      </Drawer>
      <Drawer
        anchor="top"
        open={productsOpen}
        sx={{ zIndex: 0 }}
        ModalProps={{
          BackdropProps: {
            style: {
              backgroundColor: "transparent",
            },
          },
        }}
        PaperProps={{
          sx: {
            position: "absolute",
            borderRadius: "6px",
            backgroundColor: "#FFFAF2",
            top: "60px",
            width: "20%",
            left: "59%",
            transform: "translateX(-50%)",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "10px",
          },
        }}
        onClose={toggleSidebar(false, "products")}
      >
        <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
          <li className="mb-3 border-b border-[#EDE3D2] pb-3">
            <Link
              href="/agent"
              className="hover:font-semibold"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
              }}
            >
              Agent AI
            </Link>
          </li>
          {currentUserDetails?.role === "admin" && (
            <li className="mb-3 border-b border-[#EDE3D2] pb-3">
              <Link
                href="/recruitai/sheets"
                className="hover:font-semibold"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Sheets
              </Link>
            </li>
          )}

          <li className="mb-3 border-b border-[#EDE3D2] pb-3">
            <Link
              href="/document"
              className="hover:font-semibold"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
              }}
            >
              Document AI
            </Link>
          </li>
          <li className="mb-3 border-b border-[#EDE3D2] pb-3">
            <Link
              href="/list"
              className="hover:font-semibold"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
              }}
            >
              List AI
            </Link>
          </li>
          <li className="mb-3 border-b border-[#EDE3D2] pb-3">
            <Link
              href="/image"
              className="hover:font-semibold"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
              }}
            >
              Image AI
            </Link>
          </li>

          <li className="mb-3 border-b border-[#EDE3D2] pb-3">
            <Link
              href="/chat"
              className="hover:font-semibold"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
              }}
            >
              Chat AI
            </Link>
          </li>
          <li className="mb-3 border-b border-[#EDE3D2] pb-3">
            <Link
              href="/others"
              className="hover:font-semibold"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
              }}
            >
              Others
            </Link>
          </li>
        </ul>
      </Drawer>

      <Drawer
        anchor="top"
        open={solutionOpen}
        sx={{ zIndex: 0 }}
        ModalProps={{
          BackdropProps: {
            style: {
              backgroundColor: "transparent",
            },
          },
        }}
        PaperProps={{
          sx: {
            top: `${60}px`, // Offset the drawer by the height of the header

            // Adjust the height of the drawer
          },
        }}
        onClose={toggleSidebar(false, "solution")}
      >
        <div className="p-10 gap-10 flex items-center justify-center flex-col bg-[#FFFAF2]">
          <div className="flex  w-full gap-10">
            <Link className="w-1/3 hover:text-[#FFB231]" href="/documentAI">
              <div>
                <p className="text-p-reg font-weight-h flex items-center gap-1">
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: "18px" }} />
                  Document Processing AI <ArrowRightAltRoundedIcon />
                </p>
                <p className="text-p-sm">
                  Accurately process any document in seconds
                </p>
              </div>
            </Link>

            <Link className="w-1/3 hover:text-[#FFB231]" href="/imageAI">
              <div>
                <p className="text-p-reg font-weight-h flex items-center gap-1">
                  <InsertPhotoOutlinedIcon sx={{ fontSize: "18px" }} />
                  Image Intelligence <ArrowRightAltRoundedIcon />
                </p>
                <p className="text-p-sm">
                  Take decisions based on image intelligence
                </p>
              </div>
            </Link>
            <Link className="w-1/3 hover:text-[#FFB231]" href="/supportBot">
              <div>
                <p className="text-p-reg font-weight-h flex items-center gap-1">
                  <HeadphonesOutlinedIcon sx={{ fontSize: "18px" }} />
                  Support Bots <ArrowRightAltRoundedIcon />
                </p>
                <p className="text-p-sm">
                  Automate internal and external support queries
                </p>
              </div>
            </Link>
          </div>

          <div className="flex w-full gap-10">
            <Link
              className="w-1/3 hover:text-[#FFB231]"
              href="/workflowAutomation"
            >
              <div>
                <p className="text-p-reg font-weight-h flex items-center gap-1">
                  <SmartToyRoundedIcon sx={{ fontSize: "18px" }} />
                  Workflow Automation <ArrowRightAltRoundedIcon />
                </p>
                <p className="text-p-sm">
                  Automate your internal processes through AI
                </p>
              </div>
            </Link>
            <Link className="w-1/3 hover:text-[#FFB231]" href="/fraudDetection">
              <div>
                <p className="text-p-reg font-weight-h flex items-center gap-1">
                  <WarningAmberRoundedIcon sx={{ fontSize: "18px" }} />
                  Fraud Detection <ArrowRightAltRoundedIcon />
                </p>
                <p className="text-p-sm">
                  Data based approach for detecting fraud
                </p>
              </div>
            </Link>
            <div
              className="w-1/3 hover:text-[#FFB231] hover:cursor-pointer"
              onClick={() => setOpen(true)}
            >
              <p className="text-p-reg font-weight-h flex items-center gap-1">
                <ForumOutlinedIcon sx={{ fontSize: "18px" }} />
                Talk to us <ArrowRightAltRoundedIcon />
              </p>
              <p className="text-p-sm">For any custom requirements</p>
            </div>
          </div>
        </div>
      </Drawer>
      <TalkToUs open={open} setOpen={setOpen} />
    </header>
  );
};

export default Header;
