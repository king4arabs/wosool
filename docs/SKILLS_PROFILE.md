# Wosool — Skills Profile System

## Overview

The Skills Profile system enables founders to showcase their expertise, track growth, and find complementary co-founders and advisors within the Wosool network.

## Founder Scorecard

Each founder has a scorecard with dimensions including:

| Dimension | Description |
|-----------|-------------|
| Technical | Engineering and product development skills |
| Business | Business model, strategy, fundraising |
| Leadership | Team management, vision, execution |
| Network | Community engagement, partnerships |
| Domain | Industry-specific expertise |

## Profile Fields

Founder profiles are stored in `founder_profiles` table and include:

- Name, bio, photo
- Company affiliation
- Skills and expertise tags
- Sector and stage
- Scorecard ratings
- Availability for mentoring/advising

## Matching

The matching system (Phase 2) will use skills profiles to:
- Suggest complementary founder matches
- Enable warm introductions
- Recommend mentors and advisors
- Surface relevant program opportunities

## Data Model

See [DATABASE.md](./DATABASE.md) for the full schema including `founder_profiles`, `scorecards`, and `matches` tables.
