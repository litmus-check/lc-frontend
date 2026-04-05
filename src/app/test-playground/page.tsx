"use client";
import React from "react";
import { useState } from "react";
const Page =()=>{
    const [clickedSignup, setClickedSignup] = useState(false);
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1>Test Playground</h1>
            <a onClick={() => {
                setClickedSignup(true);
            }} data-analytics-event='{"category":"Sign up","action":"click to sign up for account","label":"ref_page:/ -_ref_cta:Sign up;ref_loc:header logged out"}'>Sign up</a>

            <a href="/github-copilot/pro">  test-href   </a>

            {clickedSignup && <p>Sign up for GitHub clicked</p>}
        </div>
    );
};

export default Page;