import Image from "next/image";
import FreeAppHeader from "@/components/Header/FreeAppHeader";
import Footer from "@/components/Footer/Footer";
import MaxWidthWrapper from "@/components/MaxWidthWrapper/MaxWidthWrapper";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { PARTNER_LOGOS } from "@/lib/logos";
import Link from "next/link";


export default function Home() {




    return (
        <>
            <main className="font-hanken">
                <section id="hero-section" className="flex items-center justify-center">
                    <MaxWidthWrapper>
                        <FreeAppHeader />
                        <div className="flex flex-col items-center justify-center text-center max-w-5xl mx-auto px-4 mt-5">

                            <div className="flex flex-col gap-1 items-center text-zinc-900">
                                <h1 className="text-[32px] sm:text-[36px] md:text-[40px] lg:text-[44px] font-medium">
                                Write Playwright 5x faster with AI
                                </h1>
                                <p className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[24px] font-normal my-2 leading-tight flex items-center justify-center flex-wrap gap-2">
                                <span className="flex items-center gap-2">
                                    <Image 
                                        src="/assets/litmus-logo-v3.svg" 
                                        alt="Litmus Logo" 
                                        width={25} 
                                        height={23} 
                                        priority 
                                        
                                    />
                                    <Image 
                                        src="/assets/litmus-logo-text.svg" 
                                        alt="Litmus Logo" 
                                        width={72} 
                                        height={80} 
                                        priority 
                                        
                                    />
                                </span>
                                — the free AI-powered <span className="line-through">IDE</span> ITE (Integrated Testing Environment)
                                </p>
                               
                            </div>
                          
                           
                            <div className="flex justify-center relative items-center mx-auto overflow-hidden mt-10">
                                 <Image 
                                     src="/assets/hero-img-v3.jpg" 
                                     alt="Free App" 
                                     width={1000}
                                     height={1000}
                                     
                                     className="object-contain object-bottom"
                                     priority
                                 />
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
                  {Array(50).fill(0).flatMap(() => PARTNER_LOGOS).map((logo, idx) => (
                   
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

                <section id="how-is-litmus-better" className="bg-white">
                    <MaxWidthWrapper className="px-3.5">
                        <div className="flex flex-col items-center justify-center mb-5">
                            <h2 className="self-center font-medium text-center mt-10 max-lg:max-w-full text-[#2B2B2B] text-[24px] sm:text-[26px] md:text-[28px] lg:text-[30px]">
                                How is Litmus better?
                            </h2>
                            <div className="flex flex-col gap-8 sm:gap-10 md:gap-12 lg:gap-16 justify-center items-center my-6 sm:my-8 w-full max-w-6xl mx-auto">
                                <div className="flex flex-col md:flex-row items-center md:items-center justify-center gap-6 md:gap-10 lg:gap-12 w-full max-w-5xl mx-auto">
                                    <p className="text-[14px] sm:text-[16px] md:text-[17px] lg:text-[18px] text-center md:text-left font-normal max-w-md flex-1">Write tests in natural language and get playwright code instantly.</p>
                                    <Image src="/assets/how-litmus-1.jpg" alt="Free App" className="block w-full max-w-xs object-contain h-auto flex-shrink-0" width={0} height={0} sizes="100vw" />
                                </div>
                                <div className="flex flex-col md:flex-row items-center md:items-center justify-center gap-6 md:gap-10 lg:gap-12 w-full max-w-5xl mx-auto">
                                    <p className="text-[14px] sm:text-[16px] md:text-[17px] lg:text-[18px] text-center md:text-left font-normal max-w-md flex-1">Get multiple playwright selectors to choose from.</p>
                                    <Image src="/assets/how-litmus-2.jpg" alt="Free App" className="block w-full max-w-xs object-contain h-auto flex-shrink-0" width={0} height={0} sizes="100vw" />
                                </div>
                                <div className="flex flex-col md:flex-row items-center md:items-center justify-center gap-6 md:gap-10 lg:gap-12 w-full max-w-5xl mx-auto">
                                    <p className="text-[14px] sm:text-[16px] md:text-[17px] lg:text-[18px] text-center md:text-left font-normal max-w-md flex-1">Generate and add custom scripts to make your tests more powerful</p>
                                    <Image src="/assets/how-litmus-3.jpg" alt="Free App" className="block w-full max-w-xs object-contain h-auto flex-shrink-0" width={0} height={0} sizes="100vw" />
                                </div>
                                <div className="flex flex-col md:flex-row items-center md:items-center justify-center gap-6 md:gap-10 lg:gap-12 w-full max-w-5xl mx-auto">
                                    <p className="text-[14px] sm:text-[16px] md:text-[17px] lg:text-[18px] text-center md:text-left font-normal max-w-md flex-1">Auto-triage your failed tests with a live-agent run</p>
                                    <Image src="/assets/how-litmus-4.jpg" alt="Free App" className="block w-full max-w-xs object-contain h-auto flex-shrink-0" width={0} height={0} sizes="100vw" />
                                </div>
                            </div>
                        </div>
                    </MaxWidthWrapper>
                </section>

                <section id="approach-to-quality" className="bg-[#F8F9FD]">
                    <MaxWidthWrapper className="pt-4 px-3.5">
                        <div className="flex flex-col items-center justify-center">
                            <h2 className="self-center text-[24px] sm:text-[26px] md:text-[28px] lg:text-[30px] font-medium text-center mt-10 max-lg:max-w-full">
                                Write in english, export in Playwright
                            </h2>

                            <p className="text-[14px] sm:text-[16px] md:text-[17px] lg:text-[18px] font-normal text-center mt-3">Once the test is written, run it on LitmusCloud or download the script to run it by yourself</p>
                            {/* Mobile: JPG, Desktop: SVG */}
                            {/* <Image src="/assets/test-page.svg" alt="Test page" className="hidden sm:block w-full max-w-xs sm:max-w-md md:max-w-2xl object-contain h-auto mt-10" width={0} height={0} sizes="100vw" /> */}
                            <Image src="/assets/test-page.jpg" alt="Test page" className="block w-full max-w-md sm:max-w-lg md:max-w-2xl object-contain h-auto mt-10" width={0} height={0} sizes="100vw" />
                        </div>
                    </MaxWidthWrapper>
                </section>

                <section id="free-to-use" className="bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/assets/free-app-bg.jpg)' }}>
                    <MaxWidthWrapper className="py-4 px-2 md:px-12 max-w-7xl">
                        <div className="flex flex-col mb-10 justify-center items-center gap-4">
                            <h2 className="self-center text-[24px] sm:text-[26px] md:text-[28px] lg:text-[30px] font-medium text-center mt-10 max-lg:max-w-full">
                                Free to use. No credit card, no need to book demos.
                            </h2>
                            
                         
                          
                        </div>
                    </MaxWidthWrapper>
                </section>

                <section id="work-with-us" className="bg-[#F8F9FD]">
                    <MaxWidthWrapper className="py-4 px-3.5">
                        <div className=" flex flex-col items-center m-10 justify-center">
                            <h2 className="text-[28px] sm:text-[30px] md:text-[32px] lg:text-[36px] font-semibold text-center">Litmus is for everyone</h2>
                            <div className="flex flex-col md:flex-row mb-10 mt-10 justify-center items-center gap-4 md:gap-8">
              <div className="flex flex-col items-center justify-center w-full md:flex-1 gap-2 p-4">
                <h3 className="text-[20px] sm:text-[22px] md:text-[23px] lg:text-[24px] font-semibold text-center">
                  Small teams
                </h3>
                <p className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] font-normal text-center">
                Create tests in less than 60 mins. 
                Ship fast without worrying.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center w-full md:flex-1 gap-2 p-4">
                <h3 className="text-[20px] sm:text-[22px] md:text-[23px] lg:text-[24px] font-semibold text-center">
                  Manual QAs
                </h3>
                <p className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] font-normal text-center">
                Automate tests without spending hours learning different frameworks
                </p>
              </div>
              <div className="flex flex-col items-center justify-center w-full md:flex-1 gap-2 p-4">
                <h3 className="text-[20px] sm:text-[22px] md:text-[23px] lg:text-[24px] font-semibold text-center">
                  Engineers
                </h3>
                <p className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] font-normal text-center">
                Get better selectors out of the box and create stable tests
                </p>
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