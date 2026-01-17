# AEO SaaS Dashboard - Design Guidelines (ClickUp-Inspired)

## Design Approach
**Reference-Based**: ClickUp's visual structure, layout patterns, and component style for both marketing site and dashboard. Modern, clean SaaS aesthetic with bold typography and clear information hierarchy.

## Typography
- **Headlines**: Bold, large-scale type (similar to ClickUp's impact)
- **Body**: Clean sans-serif, high readability
- **Hierarchy**: Clear distinction between primary headlines, sub-headlines, and body text

## Layout System
Use Tailwind spacing: **p-4, p-6, p-8, p-12** for consistent rhythm. Section padding: **py-20 to py-32** on desktop, **py-12** on mobile.

## Marketing Landing Page Structure

### 1. Hero Section
- **Layout**: Full-width, centered content with dashboard mockup visual
- **Headline**: "Get your brand into AI's answers."
- **Sub-headline**: "See when ChatGPT and other AI assistants recommend you—or ignore you—and get a playbook to fix it."
- **CTAs**: Primary "Run an AI Visibility Scan" + Secondary "Watch demo"
- **Visual**: Dashboard mockup image showing the app interface
- **Height**: 80-90vh with breathing room

### 2. "AI Solutions for Every Team" Section
- **Grid**: 3-4 cards in responsive grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- **Card Style**: ClickUp-inspired cards with:
  - Team type heading
  - Short description
  - "REPLACES" bullet list (3-4 items) showing old methods replaced
- **Cards**: "For SaaS & B2B marketers", "For agencies", "For local & services businesses"

### 3. Feature Sections (3 sections)
**a) "Know when AI actually recommends you"**
- Bullet list of scanner features
- Mention AI Visibility Score and share of voice
- 2-column layout: text + visual representation

**b) "Turn gaps into an AEO roadmap"**
- Gap list explanation
- Suggested answers and page types
- Visual: mockup of gap analysis interface

**c) "Designed for growth teams and agencies"**
- Multi-project, multi-brand capabilities
- White-label reports mention
- Team collaboration features

### 4. Social Proof / ROI Section
- **Layout**: 3-column stat cards
- **Stats**:
  - "Save hours of manual AI prompt checking"
  - "See where AI should mention you but doesn't"
  - "Give your team a clear AEO backlog in minutes"
- Large numbers with descriptive text below

### 5. Pricing Section
- **Grid**: 3 columns (Starter, Growth, Pro)
- **Card Content**:
  - Tier name and price point
  - Feature limits: Projects, Prompts, Engines, Scans/month
  - Reports/alerts availability
  - CTA button per tier
- Highlight recommended tier

## In-App Dashboard Layout

### Left Sidebar
- **Structure**: Fixed sidebar similar to ClickUp
- **Content**: Projects list with icons/indicators
- Project switcher at top
- Navigation items below

### Top Bar
- **Elements**: 
  - Project name (left)
  - AI Visibility Score badge (center/right)
  - "Run scan" primary button (right)
- **Height**: ~64px, sticky positioning

### Main Content Area (Tabbed Interface)

**Overview Tab**
- **Layout**: Metric cards in grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- **Cards**:
  - AI Visibility Score (0-2 scale, color-coded)
  - Number of prompts
  - Number of engines
  - Last scan timestamp
- Large numbers with labels

**Prompts & Sets Tab**
- **Structure**: List view with expandable PromptSets
- Filters and search bar at top
- Structured list showing prompts grouped by sets
- Action buttons per item

**Results Tab**
- **Table View**: Sortable columns
  - Prompt text
  - Brand score
  - Competitor scores
- **Toggle**: "Show gaps only" filter
- Color-coded scores (green/yellow/red)

**AEO Suggestions Tab**
- **List Layout**: Gap prompts with:
  - Prompt text
  - Generated suggested answer
  - Suggested page type
  - Priority indicator
- Action buttons: "Create content", "Dismiss"

## Component Library

### Buttons
- **Primary**: Bold, high contrast (for main CTAs)
- **Secondary**: Outlined or ghost style
- **Blur backgrounds** when placed over images

### Cards
- Subtle shadows
- Rounded corners (similar to ClickUp)
- Clear padding and spacing
- Hover states with subtle lift

### Data Visualization
- **Score Badges**: Circular or pill-shaped, color-coded (red 0, yellow 1, green 2)
- **Progress Indicators**: Horizontal bars for share of voice
- **Tables**: Clean, zebra striping optional, sortable headers

### Forms/Inputs
- Clean, minimal borders
- Proper spacing and labels
- Validation states

## Images
**Hero Image**: Dashboard mockup showing the app interface with sample data, prominently displayed in hero section. Should show AI Visibility Score, prompt results, and clean interface.

**Feature Section Images**: Screenshots or mockups of specific features (gap analysis, prompt sets, results table).

## Color Philosophy
Modern SaaS palette with clear hierarchy. Avoid overwhelming use of color—let typography and layout create impact (ClickUp style: white/light backgrounds, accent colors for CTAs and scores).

## Key Design Principles
1. **Bold Typography**: Large, confident headlines
2. **Clear Information Hierarchy**: Section bands, card groupings
3. **Spacious Layouts**: Breathing room between sections
4. **Functional Clarity**: Every element serves the AEO use case
5. **Data-Forward**: Scores and metrics prominently displayed