'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ChartCard } from '@/components/admin/design-system/ChartCard';
import type { ChartDataPoint } from '@/types/admin';

// ─── Date Range Types ────────────────────────────────────────────────────────

type PresetRange = '7d' | '30d' | '90d' | 'custom';

interface DateRangeState {
  preset: PresetRange;
  customStart: string;
  customEnd: string;
}

// ─── Analytics Data Shape (mirrors get_analytics_data() in 0008_analytics.sql) ─

interface AnalyticsData {
  studentGrowth: ChartDataPoint[];
  lessonCompletion: ChartDataPoint[];
  grammarErrors: ChartDataPoint[];
  difficultLessons: ChartDataPoint[];
  grammarScoreTrend: ChartDataPoint[];
  challengePassRate: ChartDataPoint[];
  studentRetention: ChartDataPoint[];
  dailyActiveUsers: ChartDataPoint[];
  heatmap: ChartDataPoint[];
}

const EMPTY_DATA: AnalyticsData = {
  studentGrowth: [],
  lessonCompletion: [],
  grammarErrors: [],
  difficultLessons: [],
  grammarScoreTrend: [],
  challengePassRate: [],
  studentRetention: [],
  dailyActiveUsers: [],
  heatmap: [],
};

// ─── Helper: Compute max custom date (365 days from start) ───────────────────

function getMaxCustomEnd(startDate: string): string {
  if (!startDate) return '';
  const d = new Date(startDate);
  d.setDate(d.getDate() + 365);
  return d.toISOString().split('T')[0];
}

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function presetToRange(preset: PresetRange, customStart: string, customEnd: string): { start: string; end: string } {
  const end = customEnd ? new Date(customEnd) : new Date();
  if (preset === 'custom' && customStart && customEnd) {
    return { start: new Date(customStart).toISOString(), end: end.toISOString() };
  }
  const days = preset === '7d' ? 7 : preset === '90d' ? 90 : 30;
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

// ─── Analytics Page Component ────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRangeState>({
    preset: '30d',
    customStart: '',
    customEnd: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<AnalyticsData>(EMPTY_DATA);

  const applyFilter = useCallback((preset: PresetRange, customStart: string, customEnd: string) => {
    setLoading(true);
    setError(null);
    const { start, end } = presetToRange(preset, customStart, customEnd);

    fetch(`/api/admin/analytics?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
          return;
        }
        setChartData({ ...EMPTY_DATA, ...json.data });
      })
      .catch(() => setError('Failed to load analytics data'))
      .finally(() => setLoading(false));
  }, []);

  const handlePresetChange = (preset: PresetRange) => {
    setDateRange((prev) => ({ ...prev, preset }));
    if (preset !== 'custom') {
      applyFilter(preset, dateRange.customStart, dateRange.customEnd);
    }
  };

  // Load on mount, and whenever a custom range is completed
  useEffect(() => {
    if (dateRange.preset === 'custom') {
      if (!dateRange.customStart || !dateRange.customEnd) return;
      const start = new Date(dateRange.customStart);
      const end = new Date(dateRange.customEnd);
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= 0 || diffDays > 365) return;
    }
    applyFilter(dateRange.preset, dateRange.customStart, dateRange.customEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.preset, dateRange.customStart, dateRange.customEnd]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor student performance, engagement, and learning patterns.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Date Range Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-border bg-card p-1">
          {([
            { key: '7d', label: 'Last 7 days' },
            { key: '30d', label: 'Last 30 days' },
            { key: '90d', label: 'Last 90 days' },
            { key: 'custom', label: 'Custom' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handlePresetChange(key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                dateRange.preset === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={dateRange.preset === key}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers */}
        {dateRange.preset === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.customStart}
              max={getTodayISO()}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, customStart: e.target.value }))
              }
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground"
              aria-label="Start date"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <input
              type="date"
              value={dateRange.customEnd}
              min={dateRange.customStart || undefined}
              max={dateRange.customStart ? getMaxCustomEnd(dateRange.customStart) : getTodayISO()}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, customEnd: e.target.value }))
              }
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground"
              aria-label="End date"
            />
            {dateRange.customStart && dateRange.customEnd && (
              <span className="text-xs text-muted-foreground">(max 365 days)</span>
            )}
          </div>
        )}
      </div>

      {/* Charts Grid - 2 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Student Growth - Line Chart */}
        <ChartCard
          title="Student Growth"
          chartType="line"
          data={chartData.studentGrowth}
          loading={loading}
        />

        {/* Lesson Completion Rate - Bar Chart */}
        <ChartCard
          title="Lesson Completion Rate by CEFR Level"
          chartType="bar"
          data={chartData.lessonCompletion}
          loading={loading}
          emptyMessage="No lesson progress recorded yet for this range."
        />

        {/* Grammar Error Distribution - Pie Chart */}
        <ChartCard
          title="Grammar Error Distribution"
          chartType="pie"
          data={chartData.grammarErrors}
          loading={loading}
          emptyMessage="No incorrect exercise attempts recorded yet for this range."
        />

        {/* Most Difficult Lessons - Bar Chart */}
        <ChartCard
          title="Lessons Where Students Get Stuck"
          chartType="bar"
          data={chartData.difficultLessons}
          loading={loading}
          emptyMessage="Not enough attempts yet to identify difficult lessons."
        />

        {/* Average Grammar Score Trend - Line Chart */}
        <ChartCard
          title="Average Grammar Score Trend"
          chartType="line"
          data={chartData.grammarScoreTrend}
          loading={loading}
        />

        {/* Challenge Pass Rate - Bar Chart */}
        <ChartCard
          title="Challenge Pass Rate by Target Level"
          chartType="bar"
          data={chartData.challengePassRate}
          loading={loading}
          emptyMessage="No placement challenge attempts recorded yet for this range."
        />

        {/* Student Retention - Area Chart */}
        <ChartCard
          title="Student Retention"
          chartType="area"
          data={chartData.studentRetention}
          loading={loading}
        />

        {/* Daily Active Users - Area Chart */}
        <ChartCard
          title="Daily Active Users"
          chartType="area"
          data={chartData.dailyActiveUsers}
          loading={loading}
        />

        {/* Learning Activity Heatmap - full width */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Learning Activity Heatmap"
            chartType="heatmap"
            data={chartData.heatmap}
            loading={loading}
            emptyMessage="No activity recorded yet for this range."
          />
        </div>
      </div>
    </div>
  );
}
