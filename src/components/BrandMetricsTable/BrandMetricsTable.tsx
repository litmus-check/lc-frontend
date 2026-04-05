import React from "react";
import { BrandMetric } from "@/lib/apis/geology/projects";

interface BrandMetricsTableProps {
    metrics: BrandMetric[];
}

export default function BrandMetricsTable({ metrics }: BrandMetricsTableProps) {
    if (!metrics || metrics.length === 0) return null;

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="text-left px-4 py-3 text-gray-700 font-hanken">Brand</th>
                        <th className="text-right px-4 py-3 text-gray-700 font-hanken">Visibility</th>
                        <th className="text-right px-4 py-3 text-gray-700 font-hanken">Sentiment</th>
                        <th className="text-right px-4 py-3 text-gray-700 font-hanken">Position</th>
                    </tr>
                </thead>
                <tbody className="font-hanken text-sm">
                    {metrics.map((metric, index) => {
                        return (
                            <tr key={metric.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-4 py-3 text-gray-900">
                                    {metric.brand_name}
                                </td>
                                <td className="px-4 py-3 text-gray-900 text-right">{metric.visibility}</td>
                                <td className="px-4 py-3 text-gray-900 text-right">{metric.sentiment}</td>
                                <td className="px-4 py-3 text-gray-900 text-right">{metric.position}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
