'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ChartCard } from '@/components/admin/design-system/ChartCard';
import { AIInsightsSection } from '@/components/admin/analytics/AIInsightsSection';
import type { ChartDataPoint } from '@/types/admin';

// ─── Date Range Types ────────────────────────────────────────────────────────

type PresetRange = '7d' | '30d' | '90d' | 'custom';

interface DateRangeState {
  preset: PresetRange;
  customStart: string;
  customEnd: string;
}

// ─── Mock Data Generators ────────────────────────────────────────────────────

function generateLineData(points: number, baseValue: number, variance: number): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let current = baseValue;
  for (let i = 0; i < points; i++) {
    current += Math.round((Math.random() - 0.4) * variance);
    current = Math.max(0, current);
    const date = new Date();
    date.setDate(date.getDate() - (points - i));
    data.push({
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      value: current,
      date: date.toISOString(),
    });
  }
  return data;
}

function generateBarData(labels: string[], min: number, max: number): ChartDataPoint[] {
  return labels.map((label) => ({
    label,
    value: Math.round(min + Math.random() * (max - min)),
  }));
}

function generatePieData(): ChartDataPoint[] {
  const categories = [
    'Subject-Verb Agreement',
    'Tense Errors',
    'Article Misuse',
    'Preposition Errors',
    'Word Order',
    'Pronoun Reference',
  ];
  return categories.map((label) => ({
    label,
    value: Math.round(5 + Math.random() * 30),
    category: label,
  }));
}

function generateHeatmapData(): ChartDataPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data: ChartDataPoint[] = [];
  for (const day of days) {
    for (let hour = 0; hour < 24; hour++) {
      // Simulate higher activity during business hours on weekdays
      const isWeekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(day);
      const isBusinessHour = hour >= 8 && hour <= 20;
      const base = isWeekday && isBusinessHour ? 40 : 10;
      const value = Math.round(base + Math.random() * (isBusinessHour ? 60 : 20));
      data.push({
        label: `${day}-${hour}`,
        value,
        category: day,
      });
    }
  }
  return data;
}

function getChartData(range: PresetRange): {
  studentGrowth: ChartDataPoint[];
  lessonCompletion: ChartDataPoint[];
  grammarErrors: ChartDataPoint[];
  difficultLessons: ChartDataPoint[];
  grammarScoreTrend: ChartDataPoint[];
  challengePassRate: ChartDataPoint[];
  studentRetention: ChartDataPoint[];
  dailyActiveUsers: ChartDataPoint[];
  heatmap: ChartDataPoint[];
} {
  const pointCount = range === '7d' ? 7 : range === '30d' ? 30 : 20;

  return {
    studentGrowth: generateLineData(pointCount, 150, 15),
    lessonCompletion: generateBarData(
      ['Beginner A1', 'Elementary A2', 'Intermediate B1', 'Upper-Int B2', 'Advanced C1', 'Mastery C2'],
      40,
      95
    ),
    grammarErrors: generatePieData(),
    difficultLessons: generateBarData(
      ['Past Perfect', 'Conditionals III', 'Relative Clauses', 'Subjunctive', 'Passive Voice', 'Reported Speech', 'Inversion'],
      15,
      65
    ),
    grammarScoreTrend: generateLineData(pointCount, 72, 5),
    challengePassRate: generateBarData(
      ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      35,
      90
    ),
    studentRetention: generateLineData(pointCount, 85, 8),
    dailyActiveUsers: generateLineData(pointCount, 320, 40),
    heatmap: generateHeatmapData(),
  };
}

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

// ─── Analytics Page Component ────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRangeState>({
    preset: '30d',
    customStart: '',
    customEnd: '',
  });
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(() => getChartData('30d'));

  // Simulate loading delay when filter changes
  const applyFilter = useCallback((preset: PresetRange) => {
    setLoading(true);
    // Simulate 1-2s delay for data fetching
    const delay = 1000 + Math.random() * 1000;
    setTimeout(() => {
      setChartData(getChartData(preset));
      setLoading(false);
    }, delay);
  }, []);

  const handlePresetChange = (preset: PresetRange) => {
    setDateRange((prev) => ({ ...prev, preset }));
    if (preset !== 'custom') {
      applyFilter(preset);
    }
  };

  const handleCustomApply = () => {
    if (dateRange.customStart && dateRange.customEnd) {
      applyFilter('custom');
    }
  };

  // Apply custom range when both dates are filled
  useEffect(() => {
    if (dateRange.preset === 'custom' && dateRange.customStart && dateRange.customEnd) {
      // Validate max 365 days
      const start = new Date(dateRange.customStart);
      const end = new Date(dateRange.customEnd);
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 0 && diffDays <= 365) {
        handleCustomApply();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.customStart, dateRange.customEnd]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor student performance, engagement, and learning patterns.
        </p>
      </div>

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
          title="Lesson Completion Rate"
          chartType="bar"
          data={chartData.lessonCompletion}
          loading={loading}
        />

        {/* Grammar Error Distribution - Pie Chart */}
        <ChartCard
          title="Grammar Error Distribution"
          chartType="pie"
          data={chartData.grammarErrors}
          loading={loading}
        />

        {/* Most Difficult Lessons - Bar Chart */}
        <ChartCard
          title="Most Difficult Lessons"
          chartType="bar"
          data={chartData.difficultLessons}
          loading={loading}
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
          title="Challenge Pass Rate"
          chartType="bar"
          data={chartData.challengePassRate}
          loading={loading}
        />

        {/* Student Retention - Area Chart (cohort) */}
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
          />
        </div>
      </div>

      {/* AI-Powered Insights Section */}
      <AIInsightsSection />
    </div>
  );
}
