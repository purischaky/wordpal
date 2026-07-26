# Requirements Document

## Introduction

The Analytics Dashboard is an internal feature of WordPal that provides administrators and internal team members with visual insights into platform usage. It focuses on two key metrics: Daily Active Builders (DAB) — representing the count of unique users who complete at least one exercise per day — and User Retention Cohorts calculated over rolling seven-day windows. The dashboard enables the team to monitor engagement trends, identify drop-off points, and make data-informed decisions about content and product improvements.

## Glossary

- **Analytics_Dashboard**: The internal page within WordPal that displays DAB and retention cohort visualizations.
- **DAB_Chart**: The chart component that renders Daily Active Builders data as a time-series visualization.
- **Retention_Table**: The table component that displays user retention cohort data organized by rolling seven-day windows.
- **Daily_Active_Builder**: A unique authenticated user who completes at least one exercise within a single calendar day (UTC).
- **Cohort**: A group of users defined by the calendar week (rolling seven-day window) in which they first completed an exercise.
- **Retention_Rate**: The percentage of users from a given cohort who return and complete at least one exercise in a subsequent seven-day window.
- **Rolling_Window**: A consecutive seven-day period used to group user activity for retention analysis, starting from Monday through Sunday (UTC).
- **Admin_User**: An authenticated user with an admin role assignment in the Supabase database who is authorized to access the Analytics Dashboard.
- **Analytics_API**: The server-side route handler that queries Supabase and returns aggregated analytics data to the dashboard page.
- **Date_Range_Selector**: A UI control that allows Admin_User to select the time period for displayed analytics data.

## Requirements

### Requirement 1: Access Control

**User Story:** As an admin, I want the analytics dashboard restricted to authorized internal users, so that sensitive usage data is not exposed to regular builders.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to the Analytics_Dashboard route, THE Analytics_Dashboard SHALL redirect the user to the sign-in page within 2 seconds, preserving the original destination URL as a query parameter so the user is returned to the Analytics_Dashboard after successful sign-in.
2. IF an authenticated user without the admin role navigates to the Analytics_Dashboard route, THEN THE Analytics_Dashboard SHALL display a 403 Forbidden message and prevent access to analytics data without exposing any dashboard content or underlying data.
3. WHEN an Admin_User navigates to the Analytics_Dashboard route, THE Analytics_Dashboard SHALL render the dashboard with DAB_Chart and Retention_Table components within 3 seconds.
4. IF an Admin_User's session expires or becomes invalid while the Analytics_Dashboard is open, THEN THE Analytics_Dashboard SHALL redirect the user to the sign-in page within 2 seconds and cease displaying analytics data.

### Requirement 2: Daily Active Builders Visualization

**User Story:** As an admin, I want to see a time-series chart of Daily Active Builders, so that I can monitor daily engagement trends across the platform.

#### Acceptance Criteria

1. WHEN the Analytics_Dashboard loads, THE DAB_Chart SHALL display the count of Daily_Active_Builder values for each day within the selected date range as a line chart with one data point per calendar day (UTC).
2. THE DAB_Chart SHALL default to displaying the most recent 30 calendar days of DAB data, calculated as the 30-day period ending on the current UTC date.
3. WHEN an Admin_User hovers over a data point on the DAB_Chart, THE DAB_Chart SHALL display a tooltip showing the date in YYYY-MM-DD format and the integer DAB count for that day.
4. WHEN no exercise completions exist for a given day within the selected range, THE DAB_Chart SHALL display a value of zero for that day and include that day as a connected data point in the line chart.
5. THE DAB_Chart SHALL render DAB values on the y-axis starting at zero and calendar dates on the x-axis labeled in MMM DD format.
6. IF the selected date range exceeds 90 days, THEN THE DAB_Chart SHALL display a maximum of 90 days of data starting from the most recent date in the range.

### Requirement 3: Date Range Selection

**User Story:** As an admin, I want to select custom date ranges for the analytics data, so that I can examine engagement patterns during specific time periods.

#### Acceptance Criteria

1. THE Date_Range_Selector SHALL provide preset options for 7 days, 30 days, and 90 days, and a custom option that allows the Admin_User to specify a start date and an end date.
2. WHEN an Admin_User selects a date range, THE Analytics_Dashboard SHALL update both the DAB_Chart and Retention_Table to reflect data within the selected period within 3 seconds.
3. THE Date_Range_Selector SHALL prevent selection of future dates beyond the current system date.
4. THE Date_Range_Selector SHALL prevent selection of a start date after the end date.
5. WHEN the Analytics_Dashboard loads for the first time in a session, THE Date_Range_Selector SHALL default to the 30 days preset.
6. IF no data exists within the selected date range, THEN THE Analytics_Dashboard SHALL display an empty state message indicating that no data is available for the selected period.

### Requirement 4: Retention Cohort Calculation

**User Story:** As an admin, I want retention cohorts calculated over rolling seven-day windows, so that I can understand how well WordPal retains users week over week.

#### Acceptance Criteria

1. THE Analytics_API SHALL group users into cohorts based on the Rolling_Window in which the user first completed an exercise.
2. THE Analytics_API SHALL calculate Retention_Rate for each cohort by determining the percentage of cohort members who completed at least one exercise in each subsequent Rolling_Window, rounded to one decimal place.
3. WHEN a user belongs to a cohort, THE Analytics_API SHALL track that user's activity across all subsequent Rolling_Window periods within the selected date range.
4. THE Analytics_API SHALL use UTC dates for all Rolling_Window boundary calculations.
5. THE Analytics_API SHALL define each Rolling_Window as starting on Monday 00:00:00 UTC and ending on Sunday 23:59:59 UTC.
6. IF the selected date range starts or ends mid-week, THEN THE Analytics_API SHALL include only Rolling_Window periods whose Monday start date falls within or before the selected date range start, and whose Sunday end date falls within or after the selected date range end, excluding any partial weeks that do not fully fit within the selected range.
7. THE Analytics_API SHALL display the cohort's founding Rolling_Window as Week 0 with a Retention_Rate of 100 percent for each cohort row.

### Requirement 5: Retention Cohort Visualization

**User Story:** As an admin, I want to see retention cohort data displayed in a structured table, so that I can quickly identify retention trends and drop-off patterns.

#### Acceptance Criteria

1. WHEN the Analytics_Dashboard loads, THE Retention_Table SHALL display up to 12 cohorts as rows ordered from most recent to oldest, and up to 10 subsequent Rolling_Window periods as columns.
2. THE Retention_Table SHALL display the Retention_Rate as a percentage value rounded to one decimal place in each cell.
3. THE Retention_Table SHALL display the cohort size (number of users) in the first column for each cohort row.
4. THE Retention_Table SHALL apply color intensity to cells across 5 discrete levels mapped to Retention_Rate ranges (0–20%, 21–40%, 41–60%, 61–80%, 81–100%), with higher rates shown in darker shades that meet WCAG AA contrast requirements against cell text.
5. WHEN an Admin_User hovers over a Retention_Table cell, THE Retention_Table SHALL display a tooltip within 200 milliseconds showing the cohort start date, the window period, the number of retained users, and the Retention_Rate.
6. IF no cohort data is available when the Analytics_Dashboard loads, THEN THE Retention_Table SHALL display an empty state message indicating that no retention data is available for the selected period.

### Requirement 6: Analytics Data API

**User Story:** As a developer, I want a server-side API that aggregates analytics data from Supabase, so that the dashboard receives pre-computed metrics without exposing raw database queries to the client.

#### Acceptance Criteria

1. THE Analytics_API SHALL query the user_progress table to compute Daily_Active_Builder counts grouped by calendar date (UTC).
2. THE Analytics_API SHALL query the user_progress table to compute cohort membership and Retention_Rate values as defined in Requirement 4.
3. WHEN the Analytics_API receives a request with a date range parameter, THE Analytics_API SHALL return both Daily_Active_Builder counts and Retention_Rate data scoped to that date range.
4. IF the Analytics_API receives a request without a date range parameter, THEN THE Analytics_API SHALL default to the most recent 30 calendar days.
5. IF the Analytics_API receives an invalid date range parameter where the start date is after the end date or the range exceeds 365 days, THEN THE Analytics_API SHALL return a 400 status code and an error message indicating the validation failure reason.
6. IF the Analytics_API encounters a database query failure, THEN THE Analytics_API SHALL return a 500 status code and an error message indicating that the data could not be retrieved.
7. THE Analytics_API SHALL respond within 3000 milliseconds for date ranges up to 90 days.

### Requirement 7: Loading and Empty States

**User Story:** As an admin, I want clear feedback when data is loading or unavailable, so that I understand the current state of the dashboard at all times.

#### Acceptance Criteria

1. WHILE the Analytics_Dashboard is fetching data from the Analytics_API, THE Analytics_Dashboard SHALL display skeleton loading placeholders in place of the DAB_Chart and Retention_Table within 200 milliseconds of the fetch initiating.
2. IF the Analytics_API does not respond within 30 seconds, THEN THE Analytics_Dashboard SHALL stop displaying skeleton placeholders and SHALL display a timeout error message with an option to retry the data fetch.
3. WHEN the Analytics_API returns zero results for the selected date range, THE Analytics_Dashboard SHALL display an empty state message indicating no activity data exists for the selected period, along with a prompt to adjust the date range.
4. IF the Analytics_API returns an error, THEN THE Analytics_Dashboard SHALL display an error message describing the failure category and a retry button that re-initiates the data fetch.
5. WHEN the admin activates the retry option, THE Analytics_Dashboard SHALL display skeleton loading placeholders and re-initiate the data fetch, up to a maximum of 3 consecutive retry attempts.
6. IF the admin has exhausted 3 consecutive retry attempts without a successful response, THEN THE Analytics_Dashboard SHALL display a persistent error message indicating the data could not be loaded and SHALL disable the retry option.
