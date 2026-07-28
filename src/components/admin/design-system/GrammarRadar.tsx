'use client';

import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import type { BlockCategory } from '@/types/admin';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GrammarRadarProps {
  /** Grammar category scores (7 categories, each 0-100) */
  data: { category: BlockCategory; score: number }[];
  /** Chart diameter in pixels (default: 300) */
  size?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** Display labels for each grammar block category */
const CATEGORY_LABELS: Record<BlockCategory, string> = {
  subject: 'Subject',
  verb: 'Verb',
  object: 'Object',
  time: 'Time',
  place: 'Place',
  connector: 'Connector',
  modifier: 'Modifier',
  contrast: 'Contrast',
};

/** All 8 grammar block categories in display order */
const ALL_CATEGORIES: BlockCategory[] = [
  'subject',
  'verb',
  'object',
  'time',
  'place',
  'connector',
  'modifier',
  'contrast',
];

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function RadarTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { category: string; score: number } }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0].payload;
  return (
    <div
      className="rounded-[8px] border border-border bg-popover px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.12)] dark:bg-popover dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
      role="tooltip"
    >
      <p className="text-xs font-medium text-muted-foreground">
        {item.category}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-popover-foreground">
        {item.score}/100
      </p>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * GrammarRadar - A radar chart displaying grammar mastery scores across 7 block categories.
 *
 * Features:
 * - 7 axes: Subject, Verb, Object, Time, Place, Connector, Modifier
 * - Score range 0-100 per axis
 * - Tooltip on hover showing category and score
 * - Empty state when no data provided
 * - Dark mode support
 * - Responsive sizing
 *
 * Design tokens: 12px border radius, soft shadows, 200ms transitions.
 *
 * @validates Requirements 5.1, 12.1
 */
export function GrammarRadar({ data, size = 300 }: GrammarRadarProps) {
  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="rounded-[12px] border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-in-out dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col items-center justify-center py-8 text-center">
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
              d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5"
            />
          </svg>
          <p className="text-sm text-muted-foreground">No grammar data available</p>
        </div>
      </div>
    );
  }

  // Ensure all 7 categories are present, fill missing with 0
  const chartData = ALL_CATEGORIES.map((cat) => {
    const found = data.find((d) => d.category === cat);
    return {
      category: CATEGORY_LABELS[cat],
      score: found ? Math.min(100, Math.max(0, found.score)) : 0,
    };
  });

  return (
    <div
      className="rounded-[12px] border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-in-out dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
      aria-label="Grammar mastery radar chart"
    >
      <div style={{ width: '100%', maxWidth: size, height: size, margin: '0 auto' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid
              className="stroke-border"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: 'currentColor' }}
              className="text-muted-foreground"
              tickCount={5}
            />
            <RechartsTooltip content={<RadarTooltipContent />} />
            <Radar
              name="Grammar Score"
              dataKey="score"
              stroke="var(--chart-1, #6366f1)"
              fill="var(--chart-1, #6366f1)"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
