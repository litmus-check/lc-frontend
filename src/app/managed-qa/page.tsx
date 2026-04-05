import Image from "next/image";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import MaxWidthWrapper from "@/components/MaxWidthWrapper/MaxWidthWrapper";
import { ToastContainer } from "react-toastify";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import TalkToUsHandler from "@/components/TalkToUsHandler/TalkToUsHandler";
import { Button, Collapse } from "antd";
import { Metadata } from "next";
import React from "react";
import { PARTNER_LOGOS } from "@/lib/logos";

export const metadata: Metadata = {
  title: "Litmus Check",
  description: "Automate QA with Litmus AI, Ship Faster.",
  alternates: {
    canonical: "https://www.litmuscheck.com/",
  },
};

export default function Home() {
  const logos = PARTNER_LOGOS;

  return (
    <>
      <Header minimal={true} />
      <main className="font-hanken">
        <section id="hero-section" className="bg-white">
          <MaxWidthWrapper>
            <div className="flex flex-col-reverse lg:flex-row items-center justify-center pt-10 pb-5 px-2 sm:px-4 md:px-10 gap-5 max-w-6xl mb-10 mx-auto">
              <div className="flex flex-col gap-5 items-center lg:items-start h-auto w-full justify-center my-auto text-zinc-900">
                <p className="text-[40px] text-center lg:text-left font-medium max-sm:text-[32px]">
                  Your Partners in Product Quality
                </p>
                <p className="text-[20px] text-center lg:text-left font-normal max-sm:text-[18px]">
                  LitmusCheck is an AI-native service to test, automate and improve product quality.
                </p>
                <Link
                  href={"https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0bQNR6032ujwKV0oHVjnx2cp0iX8wXdJHFyivn98Yvqe9G3QoSTX9JqQ_CXMu2b0Kdw0ZRBvZv?gv=true"}
                  className="max-md:text-sm bg-[#4542CC] block md:hidden text-white px-5 py-1 rounded-md whitespace-nowrap"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="font-hanken ">
                    Talk to us
                  </span>
                </Link>
              </div>
              <div className="flex justify-center items-center w-full lg:w-auto max-w-md">
                <Image src="/assets/two-bots.jpg" alt="Litmus Logo" height={200} width={800} className="h-auto" />
              </div>
            </div>
          </MaxWidthWrapper>
        </section>

        <section id="trusted-by-logos" className="bg-[#F8F9FD]">
          <MaxWidthWrapper>
            <div className="flex flex-col items-center overflow-hidden justify-center">
              <h2 className="self-center font-normal text-center mt-10 max-lg:max-w-full text-[#2B2B2B]">
                Trusted by teams like
              </h2>
              <div className="logos md:w-4/5">
                <div className="logo_items flex gap-10 sm:gap-24 items-center justify-center">
                  {Array(5).fill(0).flatMap(() => logos).map((logo, idx) => (
                   
                    <Image
                      key={1000 + idx}
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.w}
                      height={logo.h}
                      className={logo.className}
                    />
                    
                  ))}
                </div>
              </div>
            </div>
          </MaxWidthWrapper>
        </section>

        <section id="why-litmus-check" className="bg-white py-10">
          <MaxWidthWrapper className="py-4 px-3.5">
            <h2 className="self-center text-[32px] font-medium text-center mt-5 max-lg:max-w-full">
              Why LitmusCheck?
            </h2>

            <div className="flex flex-col md:flex-row mt-10 justify-center items-center gap-12 md:gap-32 px-2">
              {/* 5X Faster test creation */}
              <div className="flex flex-col items-center w-[300px] gap-3">
                <div className="bg-[#F2D5FF] rounded-full px-6 py-3">
                  <span className="text-5xl font-bold text-gray-800">5X</span>
                </div>
                <p className="text-3xl font-semibold text-center text-gray-800">Faster test creation</p>
              </div>

              {/* 50% Cost saving */}
              <div className="flex flex-col items-center gap-3 w-[300px]">
                <div className="bg-[#F2D5FF] rounded-full px-6 py-3">
                  <span className="text-5xl font-bold text-gray-800">50%</span>
                </div>
                <p className="text-3xl font-semibold text-center text-gray-800">Cost saving</p>
              </div>

              {/* Zero Test flakes */}
              <div className="flex flex-col items-center gap-3 w-[300px]">
                <div className="bg-[#F2D5FF] rounded-full px-6 py-3">
                  <span className="text-5xl font-bold text-gray-800">Zero</span>
                </div>
                <p className="text-3xl font-semibold text-center text-gray-800">Test flakes</p>
              </div>
            </div>

            {/* Talk to us button */}
            <div className="flex justify-center mt-10">
              <Link
                href={"https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0bQNR6032ujwKV0oHVjnx2cp0iX8wXdJHFyivn98Yvqe9G3QoSTX9JqQ_CXMu2b0Kdw0ZRBvZv?gv=true"}
                className="max-md:text-sm bg-[#4542CC] text-white px-5 py-1 rounded-md whitespace-nowrap"
                target="_blank"
                rel="noopener noreferrer"
              >
                Talk to us
              </Link>
            </div>
          </MaxWidthWrapper>
        </section>

        <section id="different" className="bg-[#F8F9FD]">
          <MaxWidthWrapper className="py-4 px-2 md:px-12 max-w-7xl mx-auto">
            <h2 className="self-center text-[40px] font-medium text-center mt-10 mb-12 max-lg:max-w-full">
             What makes us different?
            </h2>
            
            {/* Mobile: Image first, then content */}
            <div className="flex flex-col lg:hidden items-center gap-8 mb-16">
              {/* Image on top for mobile */}
              <div className="flex-shrink-0">
                <Image 
                  src="/assets/different-section.jpg" 
                  alt="What makes us different - AI-first platform and Service Manager" 
                  width={400} 
                  height={400}
                  style={{width:'300px', height:'300px'}}
                  className="rounded-[50%] shadow-lg" 
                />
              </div>
              
              {/* Content sections below image on mobile */}
              <div className="flex flex-col gap-8 w-full max-w-md">
                {/* AI-first platform section */}
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-2xl font-semibold mb-4">AI-first platform</h3>
                  <ul className="space-y-3 text-center">
                    <li className="flex text-lg items-center justify-center">
                      <span className="mr-2">•</span>
                      <span className="text-gray-700">AI agent to write tests</span>
                    </li>
                    <li className="flex text-lg items-center justify-center">
                      <span className="mr-2">•</span>
                      <span className="text-gray-700">Reports and debug logs</span>
                    </li>
                    <li className="flex text-lg items-center justify-center">
                      <span className="mr-2">•</span>
                      <span className="text-gray-700">Cloud infra for running tests</span>
                    </li>
                  </ul>
                </div>

                {/* Service Manager section */}
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-2xl font-semibold mb-4">Service Manager</h3>
                  <ul className="space-y-3 text-center">
                    <li className="flex text-lg items-center justify-center">
                      <span className="mr-2">•</span>
                      <span className="text-gray-700">Creates test plan</span>
                    </li>
                    <li className="flex text-lg items-center justify-center">
                      <span className="mr-2">•</span>
                      <span className="text-gray-700">Writes custom logic</span>
                    </li>
                    <li className="flex text-lg items-center justify-center">
                      <span className="mr-2">•</span>
                      <span className="text-gray-700">Updates test as needed</span>
                    </li>
                    <li className="flex text-lg items-center justify-center">
                      <span className="mr-2">•</span>
                      <span className="text-gray-700">Available on Slack</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Desktop: Side-by-side layout */}
            <div className="hidden lg:flex flex-row items-center justify-center gap-12 mb-16">
              {/* AI-first platform section */}
              <div className="flex flex-col items-start text-center max-w-sm">
                <h3 className="text-3xl font-semibold mb-4">AI-first platform</h3>
                <ul className="space-y-3 text-left">
                  <li className="flex text-2xl items-start">
                    <span className="mr-2">•</span>
                    <span className="text-gray-700">AI agent to write tests</span>
                  </li>
                  <li className="flex text-2xl items-start">
                    <span className="mr-2">•</span>
                    <span className="text-gray-700">Reports and debug logs</span>
                  </li>
                  <li className="flex text-2xl items-start">
                    <span className="mr-2">•</span>
                    <span className="text-gray-700">Cloud infra for running tests</span>
                  </li>
                </ul>
              </div>

              {/* Central image */}
              <div className="flex-shrink-0">
                <Image 
                  src="/assets/different-section.jpg" 
                  alt="What makes us different - AI-first platform and Service Manager" 
                  width={400} 
                  height={400}
                  style={{width:'300px', height:'300px'}}
                  className="rounded-[50%] shadow-lg" 
                />
              </div>

              {/* Service Manager section */}
              <div className="flex flex-col items-start text-center max-w-sm">
                <h3 className="text-3xl font-semibold mb-4">Service Manager</h3>
                <ul className="space-y-3 text-left">
                  <li className="flex text-2xl items-start">
                    <span className="mr-2">•</span>
                    <span className="text-gray-700">Creates test plan</span>
                  </li>
                  <li className="flex text-2xl items-start">
                    <span className="mr-2">•</span>
                    <span className="text-gray-700">Writes custom logic</span>
                  </li>
                  <li className="flex text-2xl items-start">
                    <span className="mr-2">•</span>
                    <span className="text-gray-700">Updates test as needed</span>
                  </li>
                  <li className="flex text-2xl items-start">
                    <span className="mr-2">•</span>
                    <span className="text-gray-700">Available on Slack</span>
                  </li>
                </ul>
              </div>
            </div>
          </MaxWidthWrapper>
        </section>

        {/* <section id="no-code" className="bg-white mb-10">
          <MaxWidthWrapper className="py-4 px-3.5">
            <div className="flex flex-col-reverse lg:flex-row mt-10 mb-10 justify-center items-center gap-10 w-full">
              
              <div className="flex flex-col lg:items-start items-center gap-2">
                <p className="lg:text-start mb-3  text-center">Automate your testing using our no-code app</p>
                <Link href="/sign-up" className="bg-[#AE00FF] self-center w-[142px] text-white px-4 py-2 rounded-md">Sign up for free</Link>
              </div>
                <div className="flex justify-center relative items-center h-[150px] sm:h-[300px] md:h-[300px] w-full max-w-2xl rounded-lg overflow-hidden">
                 <Image 
                   src="/assets/no-code.jpg" 
                   alt="No code app" 
                   fill
                   sizes="(max-width: 640px) 90vw, (max-width: 768px) 60vw, (max-width: 1024px) 50vw, 600px"
                   className="object-contain"
                   priority
                 />
              </div>
            </div>
          </MaxWidthWrapper>
        </section> */}

        

        <section id="qa-cycle" className="bg-white">
          <MaxWidthWrapper className="py-4 px-3.5">
            {/* Mobile: Image first, then content */}
            <div className="flex flex-col lg:hidden justify-center items-center gap-8 my-16 w-full max-w-6xl mx-auto">
              {/* Image on top for mobile */}
              <div className="flex-shrink-0">
                <Image 
                  src="/assets/qa-cycle.jpg" 
                  alt="QA Cycle Diagram" 
                  width={350} 
                  height={320} 
                  className="w-[350px] h-[320px] object-contain" 
                />
              </div>
              
              {/* Text content below image on mobile */}
              <div className="flex flex-col items-center text-center max-w-lg">
                <h2 className="text-2xl font-medium mb-4">
                  The solution to endless QA cycles
                </h2>
                <p className="text-base text-[#2B2B2B] mb-6 leading-relaxed">
                  Litmus handles every facet of QA testing, so you don&apos;t have to.
                </p>
                <Link
                  href={"https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0bQNR6032ujwKV0oHVjnx2cp0iX8wXdJHFyivn98Yvqe9G3QoSTX9JqQ_CXMu2b0Kdw0ZRBvZv?gv=true"}
                  className="text-sm bg-[#4542CC] block text-white px-5 py-2 rounded-md whitespace-nowrap"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="font-hanken">
                    Talk to us
                  </span>
                </Link>
              </div>
            </div>

            {/* Desktop: Side-by-side layout */}
            <div className="hidden lg:flex flex-row justify-center items-center gap-16 my-16 w-full max-w-6xl mx-auto">
              {/* Left side - Text content */}
              <div className="flex flex-col justify-center items-start text-left max-w-lg">
                <h2 className="text-3xl font-medium mb-4">
                  The solution to endless QA cycles
                </h2>
                <p className="text-lg text-[#2B2B2B] mb-4 leading-relaxed">
                  Litmus handles every facet of QA testing, so you don&apos;t have to.
                </p>
                <Link
                  href={"https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0bQNR6032ujwKV0oHVjnx2cp0iX8wXdJHFyivn98Yvqe9G3QoSTX9JqQ_CXMu2b0Kdw0ZRBvZv?gv=true"}
                  className="max-md:text-sm bg-[#4542CC] block text-white px-5 py-1 rounded-md whitespace-nowrap"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="font-hanken">
                    Talk to us
                  </span>
                </Link>
              </div>

              {/* Right side - QA Cycle Diagram */}
              <div className="flex-shrink-0 relative">
                <Image 
                  src="/assets/qa-cycle.jpg" 
                  alt="QA Cycle Diagram" 
                  width={350} 
                  height={320} 
                  className="w-[350px] h-[320px] object-contain" 
                />
              </div>
            </div>
          </MaxWidthWrapper>
        </section>


      </main>
      <Footer />
      <ToastContainer />
    </>
  );
}