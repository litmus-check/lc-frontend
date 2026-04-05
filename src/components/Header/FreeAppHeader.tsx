"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "../AgentHeader/Header";
const FreeAppHeader = () => {
  const { isSignedIn } = useAuth();

  return (
    <>
    {isSignedIn ? (
      <Header  />
    ) : (
    
    <header
      className="w-full relative"
      style={{ height: 72 }}
      data-testid="free-app-header"
    >
      <div className="max-w-7xl mt-5 mx-auto flex items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" data-testid="app-logo-link">
          <Image
            src="/assets/litmus-logo-v3.svg"
            alt="Litmus Logo"
            width={30}
            height={40}
            priority

          />
          <Image
            src="/assets/litmus-logo-text.svg"
            alt="Litmus Logo"
            width={86}
            height={31}
            priority

          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="md:flex items-center gap-10" data-testid="free-app-desktop-nav">
          <Link
            href="https://documentation.litmuscheck.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base cursor-pointer font-medium text-zinc-900 hover:text-[#AE00FF] transition"
            data-testid="product-docs-link"
          >
            Docs
          </Link>
          
        </nav>


      </div>


    </header>
  )}
    </>
  );
};

export default FreeAppHeader; 