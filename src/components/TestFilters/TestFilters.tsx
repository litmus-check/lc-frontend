import { Button, Input, Select } from "antd";
import { useState } from "react";

interface TestFiltersProps {
    onApply: (query: string, status: string | undefined, lastRun: string | undefined) => void;
    onClear: () => void;
    initialQuery?: string;
    initialStatus?: string;
    initialLastRun?: string;
}

export default function TestFilters({
    onApply,
    onClear,
    initialQuery = "",
    initialStatus,
    initialLastRun,
}: TestFiltersProps) {
    const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(initialStatus);
    const [lastRunFilter, setLastRunFilter] = useState<string | undefined>(initialLastRun);

    const handleApply = () => {
        onApply(searchQuery, statusFilter, lastRunFilter);
    };

    const handleClear = () => {
        setSearchQuery("");
        setStatusFilter(undefined);
        setLastRunFilter(undefined);
        onClear();
    };

    return (
        <div className="flex gap-3 mb-4">
            <Input
                placeholder="Search by test name or ID"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                }}
                className="flex-1"
                data-testid="suite-tests-search-input"
                onPressEnter={handleApply}
            />
            <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={(value) => {
                    setStatusFilter(value);
                }}
                allowClear
                style={{ width: 200 }}
                data-testid="suite-tests-status-filter"
            >
                <Select.Option value="draft">Draft</Select.Option>
                <Select.Option value="ready">Ready</Select.Option>
            </Select>
            <Select
                placeholder="Filter by last run"
                value={lastRunFilter}
                onChange={(value) => {
                    setLastRunFilter(value);
                }}
                allowClear
                style={{ width: 200 }}
                data-testid="suite-tests-lastrun-filter"
            >
                <Select.Option value="success">Success</Select.Option>
                <Select.Option value="failed">Failed</Select.Option>
                <Select.Option value="error">Error</Select.Option>
                <Select.Option value="null">None (N/A)</Select.Option>
            </Select>
            <Button
                type="primary"
                onClick={handleApply}
                data-testid="suite-tests-apply-button"
            >
                Apply
            </Button>
            <Button
                onClick={handleClear}
                data-testid="suite-tests-clear-button"
            >
                Clear
            </Button>
        </div>
    );
}
