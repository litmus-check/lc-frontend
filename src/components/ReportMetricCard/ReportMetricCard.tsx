"use client";
import React, { useMemo } from "react";
import { Table } from "antd";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyDataPoint, BrandMapping, Averages, SentimentDetail } from "@/lib/apis/geology/projects";
import dayjs from "dayjs";

interface ReportMetricCardProps {
  title: string;
  dailyData: DailyDataPoint[];
  averages: { [brandId: string]: number };
  brandMapping: BrandMapping;
  showPercentage?: boolean;
  reverseYAxis?: boolean;
  sentimentDetails?: SentimentDetail[];
  projectId: string;
}

// Color palette for different brands
const COLORS = ["#000000", "#8B4513", "#8B00FF", "#FF0000", "#00FF00", "#0000FF"];

export default function ReportMetricCard({
  title,
  dailyData,
  averages,
  brandMapping,
  showPercentage = true,
  reverseYAxis = false,
  sentimentDetails,
  projectId,
}: ReportMetricCardProps) {
  // Get tracked brand IDs (for chart) - only show brands with tracked: true
  const trackedBrandIds = useMemo(() => {
    const ids = new Set<string>();
    dailyData.forEach((point) => {
      Object.keys(point).forEach((key) => {
        if (key !== "date") {
          const brand = brandMapping[key];
          // Only include if tracked is explicitly true
          if (brand && brand.tracked === true) {
            ids.add(key);
          }
        }
      });
    });
    return Array.from(ids);
  }, [dailyData, brandMapping]);

  // Get brand IDs from averages (for table) - only show brands that have an average for this metric
  const tableBrandIds = useMemo(() => {
    return Object.keys(averages);
  }, [averages]);

  // Transform data for chart - only include tracked brands
  const chartData = useMemo(() => {
    return dailyData.map((point) => {
      const dataPoint: any = { date: point.date };
      trackedBrandIds.forEach((brandId) => {
        const brandName = brandMapping[brandId]?.brand_name || brandId;
        const value = point[brandId];
        dataPoint[brandName] = value !== null && value !== undefined ? Number(value) : null;
      });
      return dataPoint;
    });
  }, [dailyData, brandMapping, trackedBrandIds]);

  // Prepare table data - only brands that appear in the averages object for this metric
  const tableData = useMemo(() => {
    return tableBrandIds
      .map((brandId, index) => {
        const brand = brandMapping[brandId];
        const average = averages[brandId];
        const displayValue = showPercentage
          ? `${average?.toFixed(2) ?? 0}%`
          : average?.toFixed(2) ?? 0;

        return {
          key: brandId,
          srNo: index + 1,
          name: brand?.brand_name ?? brandId,
          brandType: brand?.brand_type === "own" ? "Own" : brand?.brand_type === "competition" ? "Competition" : "-",
          average: displayValue,
          averageValue: average ?? 0,
        };
      })
      .map((item, index) => ({
        ...item,
        srNo: index + 1,
      }));
  }, [tableBrandIds, brandMapping, averages, showPercentage]);

  const columns = [
    {
      title: "Brand Name",
      dataIndex: "name",
      key: "name",
      className: "font-hanken",
    },
    {
      title: "Brand Type",
      dataIndex: "brandType",
      key: "brandType",
      className: "font-hanken",
    },
    {
      title: `Avg ${title}`,
      dataIndex: "average",
      key: "average",
      className: "font-hanken",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
      <h2 className="text-xl font-bold font-hanken text-black mb-6">{title}</h2>
      <div className="flex gap-6">
        {/* Chart Section */}
        <div className="flex-1" style={{ minHeight: "400px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
              <XAxis
                dataKey="date"
                className="font-hanken text-xs"
                tick={{ fill: "#666" }}
                tickFormatter={(value) => {
                  const date = dayjs(value);
                  return date.isValid() ? date.format("D-MMM") : value;
                }}
              />
              <YAxis
                domain={showPercentage ? [0, 100] : ["auto", "auto"]}
                reversed={reverseYAxis}
                className="font-hanken text-xs"
                tick={{ fill: "#666" }}
                label={{
                  value: title,
                  position: "insideLeft",
                  angle: -90,
                  style: { textAnchor: "middle", fill: "#666" }
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontFamily: "Hanken Grotesk, sans-serif"
                }}
                labelFormatter={(value) => {
                  const date = dayjs(value);
                  return date.isValid() ? date.format("D-MMM") : value;
                }}
              />
              <Legend
                align="right"
                wrapperStyle={{ fontFamily: "Hanken Grotesk, sans-serif", fontSize: "12px" }}
              />
              {trackedBrandIds?.map((brandId, index) => {
                const brandName = brandMapping[brandId]?.brand_name || brandId;
                return (
                  <Line
                    key={brandId}
                    type="monotone"
                    dataKey={brandName}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    name={brandName}
                    connectNulls={true}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Table Section */}
        <div className="w-96">
          <Table
            dataSource={tableData}
            rowKey="key"
            columns={columns}
            pagination={false}
            size="small"
            className="font-hanken"
            rowClassName="font-hanken cursor-pointer hover:bg-gray-50"
            onRow={(record) => {
              return {
                onClick: () => {
                  const brandName = encodeURIComponent(record.name);
                  
                  // Store sentiment_details in sessionStorage for the snippets page
                  if (sentimentDetails) {
                    try {
                      sessionStorage.setItem('reportSentimentDetails', JSON.stringify(sentimentDetails));
                    } catch (error) {
                      console.error('Failed to store sentiment details in sessionStorage:', error);
                    }
                  }
                  
                  window.open(`/geology/projects/${projectId}/snippets/${brandName}`, '_blank');
                },
              };
            }}
          />
        </div>
      </div>
    </div>
  );
}

