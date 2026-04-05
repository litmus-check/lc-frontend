"use client";
import React from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Sample chart data
const chartData = [
  {
    name: 'Page A',
    uv: 400,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 300,
    pv: 4567,
    amt: 2400,
  },
  {
    name: 'Page C',
    uv: 320,
    pv: 1398,
    amt: 2400,
  },
  {
    name: 'Page D',
    uv: 200,
    pv: 9800,
    amt: 2400,
  },
  {
    name: 'Page E',
    uv: 278,
    pv: 3908,
    amt: 2400,
  },
  {
    name: 'Page F',
    uv: 189,
    pv: 4800,
    amt: 2400,
  },
];

export default function GeologyChart() {
  return (
    <div className="w-1/2 bg-white rounded-lg shadow-md p-6" style={{ height: '50vh' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            bottom: 5,
            left: 0,
          }}
        >
          <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
          <Line type="monotone" dataKey="uv" stroke="purple" strokeWidth={2} name="My data series name" />
          <XAxis dataKey="name" />
          <YAxis width="auto" label={{ value: 'UV', position: 'insideLeft', angle: -90 }} />
          <Legend align="right" />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

