"use client";
import { Button } from "antd";
import { useState } from "react";
import Link from "next/link";
import TalkToUs from "../TalktoUs/TalktoUs";

interface TalkToUsHandlerProps {
  content: string;
}
export default function TalkToUsHandler({ content }: TalkToUsHandlerProps) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  return (
    <>
      {content !== "scheduleDemo" ? (
        <Link
          className="h-[48px] w-full max-w-[196px] rounded-[3px] flex justify-center items-center border-none hover:!border-none hover:!bg-[#AE00FF] bg-[#AE00FF] px-4"
          href={
            " https://calendar.google.com/calendar/appointments/schedules/AcZssZ0bQNR6032ujwKV0oHVjnx2cp0iX8wXdJHFyivn98Yvqe9G3QoSTX9JqQ_CXMu2b0Kdw0ZRBvZv?gv=true"
          }
        >
          <span className="text-[17px] font-medium font-hanken text-white whitespace-nowrap">
            See Litmus in Action
          </span>
        </Link>
      ) : (
        <Link
          className="h-[40px] w-full max-w-[208px] rounded-[3px] flex justify-center items-center border-none hover:!border-none hover:!bg-[#AE00FF] bg-[#AE00FF] px-4"
          href={
            " https://calendar.google.com/calendar/appointments/schedules/AcZssZ0bQNR6032ujwKV0oHVjnx2cp0iX8wXdJHFyivn98Yvqe9G3QoSTX9JqQ_CXMu2b0Kdw0ZRBvZv?gv=true"
          }
        >
          <span className="text-[17px] font-medium font-hanken text-white whitespace-nowrap">
            Schedule a demo
          </span>
        </Link>
      )}
      <TalkToUs open={open} setOpen={setOpen} />
    </>
  );
}
