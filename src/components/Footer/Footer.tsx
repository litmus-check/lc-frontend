'use client';
import Image from 'next/image'
import Link from 'next/link'
import { FC } from 'react'
import MaxWidthWrapper from '@/components/MaxWidthWrapper/MaxWidthWrapper'
import { Button } from '../ui/button'
import { TextField } from '@mui/material'
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { useState } from 'react'
import { toast } from 'react-toastify';
import axios from 'axios';
import {CircularProgress} from '@mui/material';
interface headerProps { }

const FooterWebsite: FC<headerProps> = ({ }) => {
    const [footerText, setFooterText] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubscribe=async()=>{
      setLoading(true)
        try {
          const response = await axios.post('/api/slack', {
            name: 'Subscriber',
            email: footerText
          }, {
            headers: {
              'Content-Type': 'application/json',
            }},);
            
          if (response.status === 200) {
            setLoading(false)
            toast.success('Subscription successful!');
            setFooterText('');
          } else {
            setLoading(false)
            toast.error('There was an error in submitting your details.')
          }
          
        } catch (error) {
          setLoading(false)
          toast.error('There was an error in submitting your details. Please try again.')
          
        }
    }

  return (
    <footer className="mt-auto bg-[#4542CC] font-hanken text-white">
        <MaxWidthWrapper className="py-2 px-3.5 md:px-24 text-xs">
          <div className="flex max-lg:flex-col max-lg:gap-10 my-10">
            
            <div className="flex flex-col max-lg:items-center">
              <Image
                src="/assets/footer-logo.svg"
                alt="Litmus Check Logo"
                height={160}
                width={160}
                className="max-md:w-[160px] max-md:h-auto"
              />
           
            </div>

            <div className="flex flex-col gap-6 ml-[100px] max-lg:ml-0 max-lg:items-center max-lg:text-center">
              <p className="text-[16px] font-semibold">Company</p>
            </div>

            <div className="flex flex-col gap-6 ml-[100px] max-lg:ml-0 max-lg:items-center max-lg:text-center">
              <p className="text-[16px] font-semibold">Product</p>
              
              <Link href="https://documentation.litmuscheck.com/">
                <p className="text-[14px] font-normal">Documentation</p>
              </Link>
            </div>

            <div className="flex gap-6 ml-[100px] max-lg:ml-0 max-lg:justify-center max-lg:items-center max-lg:text-center">
             
             
            {/* <Image src="/assets/aicpa.svg" alt="AICPA Logo" height={100} width={100} className="w-[100px] h-[100px]" />
            <Image src="/assets/ISO_new.svg" alt="ISO Logo" height={100} width={100} className="w-[100px] h-[100px]" /> */}
            </div>

          </div>
          <div className="flex gap-3 items-center max-lg:justify-center">
            <span className="text-[14px] font-weight-p">
              © 2026 LitmusCheck. All rights reserved.
            </span>
          </div>
        </MaxWidthWrapper>
      </footer>

  )
}

export default FooterWebsite
