'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartDataPoint } from '@/types/admin';

/** Date range filter for charts */
export interface DateRange {
  start: string;
  end: string;
}

export interface ChartCardProps {
  /** Chart title - max 80 characters */
  title: string;
  /** Type of chart to render */
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'heatmap';
  /** Data points to display (1 to 1000) */
  data: ChartDataPoint[];
  /** Optional date range filter */
  dateRange?: DateRange;
  /** Show loading skeleton state */
  loading?: boolean;
  /** Custom message for empty state */
  emptyMessage?: string;
}

/** Design system chart color palette */
const CHART_COLORS = [
  'var(--chart-1, #6366f1)',
  'var(--chart-2, #8b5cf6)',
  'var(--chart-3, #a855f7)',
  'var(--chart-4, #ec4899)',
  'var(--chart-5, #f43f5e)',
  '#06b6d4',
  '#14b8a6',
  '#22c55e',
  '#eab308',
  '#f97316',
];

/**
 * Calculates the percentage change between two values.
 */
function getPercentageChange(current: number, previous: number): string | null {
  if (previous === 0) return null;
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
}

/**
 * Custom tooltip component for charts.
 * Displays exact value, label, and percentage change from previous point.
 */
function ChartTooltipContent({
  active,
  payload,
  label,
  data,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; dataKey: string }>;
  label?: string;
  data: ChartDataPoint[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  const currentValue = payload[0].value;
  const currentIndex = data.findIndex(
    (d) => d.label === label && d.value === currentValue
  );
  const previousValue =
    currentIndex > 0 ? data[currentIndex - 1].value : null;
  const percentChange =
    previousValue !== null
      ? getPercentageChange(currentValue, previousValue)
      : null;

  return (
    <div
      className="rounded-[8px] border border-border bg-popover px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.12)] dark:bg-popover dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
      role="tooltip"
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-popover-foreground">
        {currentValue.toLocaleString()}
      </p>
      {percentChange && (
        <p
          className={`mt-0.5 text-xs font-medium ${
            percentChange.startsWith('+')
              ? 'text-[#047857] dark:text-[#34D399]'
              : 'text-[#B91C1C] dark:text-[#FCA5A5]'
          }`}
        >
          {percentChange} from previous
        </p>
      )}
    </div>
  );
}

/**
 * Custom tooltip for pie chart segments.
 */
function PieTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { label: string; value: number } }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0];
  return (
    <div
      className="rounded-[8px] border border-border bg-popover px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.12)] dark:bg-popover dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
      role="tooltip"
    >
      <p className="text-xs font-medium text-muted-foreground">{item.name}</p>
      <p className="mt-0.5 text-sm font-semibold text-popover-foreground">
        {item.value.toLocaleString()}
      </p>
    </div>
  );
}

/**
 * Renders a heatmap grid using the data points.
 * Expects data with labels representing cells (e.g. "Mon-0", "Mon-1"... for day-hour).
 */
function HeatmapChart({ data }: { data: ChartDataPoint[] }) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  // Group data for a 7x24 grid (day of week × hour)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[400px]">
        <div className="mb-1 flex gap-0.5 pl-10">
          {hours.filter((_, i) => i % 4 === 0).map((h) => (
            <span
              key={h}
              className="text-[10px] text-muted-foreground"
              style={{ width: `${(100 / 24) * 4}%` }}
            >
              {h}:00
            </span>
          ))}
        </div>
        {days.map((day) => (
          <div key={day} className="flex items-center gap-0.5">
            <span className="w-9 shrink-0 text-[10px] text-muted-foreground">
              {day}
            </span>
            <div className="flex flex-1 gap-0.5">
              {hours.map((hour) => {
                const point = data.find(
                  (d) => d.label === `${day}-${hour}` || d.category === day
                );
                const value = point?.value ?? 0;
                const intensity = maxValue > 0 ? value / maxValue : 0;
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="aspect-square flex-1 rounded-[2px] transition-colors duration-200"
                    style={{
                      backgroundColor: `rgba(99, 102, 241, ${Math.max(0.05, intensity)})`,
                    }}
                    title={`${day} ${hour}:00 - ${value}`}
                    role="gridcell"
                    aria-label={`${day} ${hour}:00: ${value} activities`}
                  />
                );
              })}
            </div>
          </div>
        ))}
        {/* Legend */}
        <div className="mt-2 flex items-center justify-end gap-1 pl-10">
          <span className="text-[10px] text-muted-foreground">Less</span>
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((intensity) => (
            <div
              key={intensity}
              className="h-3 w-3 rounded-[2px]"
              style={{
                backgroundColor: `rgba(99, 102, 241, ${intensity})`,
              }}
            />
          ))}
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  );
}

/**
 * ChartCard - A design system component that renders various chart types using Recharts.
 *
 * Supports: line, bar, pie, area, and heatmap chart types.
 * Features:
 * - Tooltip on hover: exact value, label, and percentage change from previous point
 * - Empty state when fewer than 2 data points
 * - Loading skeleton state
 * - Dark mode support
 * - Responsive sizing
 *
 * Design tokens: 12px border radius, soft shadows, 200ms transitions.
 *
 * @validates Requirements 11.1, 11.2, 11.5, 11.6, 18.4
 */
export function ChartCard({
  title,
  chartType,
  data,
  dateRange: _dateRange,
  loading = false,
  emptyMessage = 'More data is needed to display this chart. At least 2 data points are required.',
}: ChartCardProps) {
  if (loading) {
    return (
      <div
        className="rounded-[12px] border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-in-out dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
        role="status"
        aria-label={`Loading ${title} chart`}
      >
        <div className="mb-4 h-5 w-1/3 animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded bg-muted" />
        <div className="h-[250px] w-full animate-[skeleton-pulse_1500ms_ease-in-out_infinite] rounded-[8px] bg-muted" />
      </div>
    );
  }

  // Empty state: fewer than 2 data points
  if (data.length < 2) {
    return (
      <div className="rounded-[12px] border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-in-out dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg
            className="mb-3 h-10 w-10 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[12px] border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-in-out hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        {title}
      </h3>
      <div className="h-[250px] w-full" aria-label={`${title} ${chartType} chart`}>
        {chartType === 'line' && <LineChartView data={data} />}
        {chartType === 'bar' && <BarChartView data={data} />}
        {chartType === 'pie' && <PieChartView data={data} />}
        {chartType === 'area' && <AreaChartView data={data} />}
        {chartType === 'heatmap' && <HeatmapChart data={data} />}
      </div>
    </div>
  );
}

function LineChartView({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <RechartsTooltip
          content={<ChartTooltipContent data={data} />}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS[0]}
          strokeWidth={2}
          dot={{ r: 3, fill: CHART_COLORS[0] }}
          activeDot={{ r: 5, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BarChartView({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <RechartsTooltip
          content={<ChartTooltipContent data={data} />}
        />
        <Bar
          dataKey="value"
          fill={CHART_COLORS[0]}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PieChartView({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={40}
          paddingAngle={2}
          label={({ name, percent }: { name?: string; percent?: number }) =>
            `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
          }
          labelLine={{ strokeWidth: 1 }}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <RechartsTooltip content={<PieTooltipContent />} />
        <Legend
          wrapperStyle={{ fontSize: '11px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function AreaChartView({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <RechartsTooltip
          content={<ChartTooltipContent data={data} />}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={CHART_COLORS[0]}
          strokeWidth={2}
          fill="url(#areaGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
