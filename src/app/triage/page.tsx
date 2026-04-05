"use client";
import Image from "next/image";
import FreeAppHeader from "@/components/Header/FreeAppHeader";
import Footer from "@/components/Footer/Footer";
import MaxWidthWrapper from "@/components/MaxWidthWrapper/MaxWidthWrapper";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Input, message } from "antd";
import { Metadata } from "next";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { extractErrorMessage } from "@/lib/utils";
import { PARTNER_LOGOS } from "@/lib/logos";
import Link from "next/link";


export default function Home() {
    const [urlInput, setUrlInput] = useState("");
    const [urlError, setUrlError] = useState(false);
    const router = useRouter();
    const { getToken } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();

    const validateAndStartTest = async () => {
        if (!urlInput.trim()) {
            setUrlError(true);
            return;
        }
        // URL validation regex
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!urlPattern.test(urlInput)) {
            setUrlError(true);
            return;
        }
        setUrlError(false);


        try {
            const token = await getToken({ template: "basic" });
            if (!token) {
                router.push('/sign-in');
                return;
            }

            // Redirect to dashboard/suite with compose=true query parameter and the URL
            router.push(`/dashboard/suite?compose=true&url=${encodeURIComponent(urlInput)}`);
        } catch (error: any) {
            messageApi.error(extractErrorMessage(error) || "An error occurred while starting the test");
        }
    };

    return (
        <>
            {contextHolder}
            <main className="font-hanken">
                <section id="hero-section"  >
                    <MaxWidthWrapper>
                        <FreeAppHeader />
                        <div className="flex flex-col max-w-5xl mx-auto px-4 sm:px-6 md:px-8">

                            <div className="flex flex-col gap-1 text-center sm:text-left ml-0 sm:ml-6 md:ml-8 lg:ml-10 text-zinc-900 mt-8">
                                <p className="text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] xl:text-[38px] font-medium">
                                Analyse Playwright failures with a single command
                                </p>
                                <p className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[24px] font-normal mt-3 sm:mt-4 md:mt-5">
                                AI report that separates critical bugs from flaky tests in a few minutes
                                </p>
                            </div>
                            
                          
                           
                            <div className="flex justify-center sm:justify-start relative items-center h-[100px] mx-auto sm:mx-0 sm:ml-4 md:ml-10 lg:ml-10 w-full sm:w-4/5 md:w-3/5 lg:w-1/2 max-w-2xl overflow-hidden mt-4 sm:mt-6">
                                 <Image 
                                     src="/assets/npm-content.jpg" 
                                     alt="npm content" 
                                     fill
                                     sizes="(max-width: 375px) 90vw, (max-width: 640px) 70vw, (max-width: 768px) 50vw, (max-width: 1024px) 40vw, 500px"
                                     className="object-contain sm:object-left object-center"
                                     priority
                                     quality={90}
                                 />
                            </div>

                            <div className="flex relative overflow-hidden mt-10">
                                 <Image 
                                     src="/assets/triage-pic.jpg" 
                                     alt="triage picture" 
                                     width={1000}
                                     height={1000}
                                     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                                     className="object-contain object-bottom"
                                     priority
                                     quality={90}
                                 />
                            </div>

                        </div>
                    </MaxWidthWrapper>
                </section>

                <section id="trusted-by-logos" className="bg-[#F8F9FD]">
          <MaxWidthWrapper>
            <div className="flex flex-col items-center overflow-hidden justify-center">
              <h2 className="self-center font-normal text-center mt-8 sm:mt-10 max-lg:max-w-full text-[#2B2B2B] text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px]">
                Trusted by teams like
              </h2>
              <div className="logos md:w-4/5">
                <div className="logo_items flex gap-10 sm:gap-24 items-center justify-center">
                  {Array(50).fill(0).flatMap(() => PARTNER_LOGOS).map((logo, idx) => (
                   
                    <Image
                      key={1000 + idx}
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.w}
                      height={logo.h}
                      className={`${logo.className}`}
                      
                    />
                    
                  ))}
                </div>
              </div>
            </div>
          </MaxWidthWrapper>
        </section>

        <section id="free-to-use" className="bg-cover bg-center bg-no-repeat bg-[length:auto_100%] sm:bg-[length:auto_100%] md:bg-cover" style={{ backgroundImage: 'url(/assets/free-app-bg.jpg)' }}>
                    <MaxWidthWrapper className="py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-12 max-w-7xl">
                        <div className="flex flex-col mb-8 sm:mb-10 justify-center items-center gap-3 sm:gap-4">
                            <h2 className="self-center text-[20px] sm:text-[24px] md:text-[26px] lg:text-[28px] xl:text-[30px] font-medium text-center mt-8 sm:mt-10 max-lg:max-w-full">
                                Free to use. No credit card, no need to book demos.
                            </h2>
                            <p className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] font-normal text-center px-4">
                            Just sign up and start testing in a few minutes
                            </p>
                          <div className="flex justify-center items-center gap-4 flex-wrap px-4">
                            <Link href="/sign-up?redirect=/settings" className="bg-[#AE00FF] text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-md text-[14px] sm:text-[15px] md:text-[16px] whitespace-nowrap font-medium hover:opacity-90 transition-opacity" >
                              Sign up to get free API key
                            </Link>
                            
                          </div>
                          
                        </div>
                    </MaxWidthWrapper>
                </section>

                <section id="2-min-to-setup" className="bg-white">
                    <MaxWidthWrapper className="px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="flex flex-col items-center justify-center mb-5">
                            <h2 className="self-center font-medium text-center mt-8 sm:mt-10 max-lg:max-w-full text-[#2B2B2B] text-[20px] sm:text-[24px] md:text-[26px] lg:text-[28px] xl:text-[30px] px-4">
                                2 minutes to set up, immediate insights
                            </h2>
                            <div className="flex flex-col md:flex-row justify-between items-start mt-8 sm:mt-10 md:mt-12 mb-8 sm:mb-10 md:mb-12 gap-6 md:gap-4 max-w-6xl mx-auto">
                                <div className="flex w-full md:w-1/3 text-center flex-col gap-2 sm:gap-3 items-center justify-center px-4 sm:px-6">
                                    <h3 className="font-semibold text-[16px] sm:text-[18px] md:text-[19px] lg:text-[20px]">Works on top of playwright</h3>
                                    <p className="text-[14px] sm:text-[15px] md:text-[16px] leading-relaxed">
                                    No setup, just add a few lines to playwright config
                                    </p>

                                </div>
                                <div className="flex w-full md:w-1/3 text-center flex-col gap-2 sm:gap-3 items-center justify-center px-4 sm:px-6">
                                    <h3 className="font-semibold text-[16px] sm:text-[18px] md:text-[19px] lg:text-[20px]">Run locally or on cloud</h3>
                                    <p className="text-[14px] sm:text-[15px] md:text-[16px] leading-relaxed">
                                    Secure <a href="https://www.npmjs.com/package/litmus-agent" className="text-[#4542CC]" target="_blank" rel="noopener noreferrer">npm package</a> that can run anywhere
                                    </p>

                                </div>
                                <div className="flex w-full md:w-1/3 text-center flex-col gap-2 sm:gap-3 items-center justify-center px-4 sm:px-6">
                                    <h3 className="font-semibold text-[16px] sm:text-[18px] md:text-[19px] lg:text-[20px]">Free to use</h3>
                                    <p className="text-[14px] sm:text-[15px] md:text-[16px] leading-relaxed">
                                    Completely free to use while in beta. <a href="/sign-up?redirect=/settings" className="text-[#4542CC]" target="_blank" rel="noopener noreferrer">Sign up</a> to grab your free API key
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-8 sm:gap-10 md:gap-12 lg:gap-16 justify-center items-center my-6 sm:my-8 w-full max-w-6xl mx-auto">
                                <div className="flex flex-col items-center md:items-start justify-center gap-3 w-full max-w-5xl mx-auto px-4">
                                    <p className="text-[14px] sm:text-[16px] md:text-[17px] lg:text-[18px] text-center md:text-left font-semibold w-full leading-tight">Step 1. Enable playwright json report if you haven&apos;t</p>
                                    
                                    <pre className="bg-[#F6E3FF4A] p-3 sm:p-4 md:p-5 w-full overflow-x-auto text-[12px] sm:text-[13px] md:text-[14px] leading-relaxed rounded">
    <code className="whitespace-pre">
    {`export default defineConfig({
    testDir: './tests',
    retries: 0,
    reporter: [
        ['json', { outputFile: './reports/report.json' }]
    ],
    use: {
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    outputDir: './traces',
    projects: [
        {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] }
        }
    ]
    });`}
    </code>
    </pre>

                                </div>
                                <div className="flex flex-col items-center md:items-start justify-center gap-3 w-full max-w-5xl mx-auto px-4">
                                    <p className="text-[14px] sm:text-[16px] md:text-[17px] lg:text-[18px] text-center md:text-left font-semibold w-full leading-tight">Step 2. Add an API key to your environment</p>
                                    <p className="text-[14px] sm:text-[15px] md:text-[16px] text-center md:text-left leading-relaxed">Get your API key by <a href="/sign-up?redirect=/settings" className="text-[#4542CC]" target="_blank" rel="noopener noreferrer">signing up</a>. Environment variable can be set in a .env file in the root directory or as system environment variables.</p>
                                    <p className="bg-[#F6E3FF4A] p-3 sm:p-4 md:p-5 w-full overflow-x-auto text-[12px] sm:text-[14px] md:text-[16px] font-mono rounded break-all">LITMUS_API_KEY=your-api-key-here</p>
                                </div>
                                <div className="flex flex-col items-center md:items-start justify-center gap-3 w-full max-w-5xl mx-auto px-4">
                                    <p className="text-[14px] sm:text-[16px] md:text-[17px] lg:text-[18px] text-center md:text-left font-semibold w-full leading-tight">Step 3. Litmus Triage Agent is now ready to run!</p>
                                    <p className="text-[14px] sm:text-[15px] md:text-[16px] text-center md:text-left leading-relaxed">After installation, the lc command will be available globally (or via npx if installed locally).</p>
                                    <pre className="bg-[#F6E3FF4A] p-3 sm:p-4 md:p-5 w-full overflow-x-auto text-[12px] sm:text-[13px] md:text-[14px] leading-relaxed rounded">
                                        <code className="whitespace-pre">
                                            {`# Basic Usage
lc triage <path-to-report.json>

# Save API response to file with pretty printing 
lc triage <path-to-report.json> --output response.json --pretty`}
                                        </code>

                                    </pre>

                                    <div className="w-full mt-6 sm:mt-8 md:mt-10">
                                        <p className="font-semibold text-[14px] sm:text-[16px] md:text-[17px] mb-2 sm:mb-3">Options</p>
                                        <ul className="list-disc list-inside font-hanken text-[13px] sm:text-[14px] md:text-[15px] space-y-1 sm:space-y-2 leading-relaxed">
                                            <li className="ml-2 break-words">{`<path-to-report.json> - Path to Playwright JSON report file (required)`}</li>
                                            <li className="ml-2 break-words">{`-o, --output <file> - Output file path for API response (default: stdout)`}</li>
                                            <li className="ml-2 break-words">{`-p, --pretty - Pretty-print JSON output`}</li>
                                            <li className="ml-2 break-words">{`-c, --error-context <number> - Number of context lines for error snippets (default: 10)`}</li>
                                            <li className="ml-2 break-words">{`-V, --version - Output version number`}</li>
                                            <li className="ml-2 break-words">{`-h, --help - Display help`}</li>
                                            <li className="ml-2 break-words">{`--html-dir - Generate HTML report in this directory`}</li>
                                        </ul>
                                    </div>
                                </div>
                                
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