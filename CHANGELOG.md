# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initialize Supabase for local development with versioned SQL migrations (`001-004`) for database tracking tables `logs` and `daily_summaries`.
- Added Row Level Security (RLS) policies for user isolation, triggers, and indexes.
- Created `MacroRings.tsx` animated Framer Motion component for dashboard tracking.
- Implemented TDEE macro calculation utilities in `lib/tdee.ts`.
- Integrated missing `chip-agent.ts` to manage mascot logic matrix based on meal data.
- Added API endpoints for `/api/roast`, `/api/dashboard`, and `/api/log` to facilitate app main workflows.
- Completed responsive Log Meal flow utilizing camera uploads and Anthropic Claude Vision AI.
- Updated `README.md` with Hackathon spec documentation.
