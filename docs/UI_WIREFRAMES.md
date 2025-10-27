# DigitalTide - UI Wireframes & Design Specifications

**Version**: 1.0  
**Last Updated**: October 26, 2025  
**Designer**: DigitalTide Team

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Consumer Platform Wireframes](#2-consumer-platform-wireframes)
3. [Admin Control Center Wireframes](#3-admin-control-center-wireframes)
4. [Responsive Design Breakpoints](#4-responsive-design-breakpoints)
5. [Component Library](#5-component-library)
6. [Color Scheme & Typography](#6-color-scheme--typography)

---

## 1. Design Philosophy

### Core Principles

**Clean & Minimal**:
- Focus on content, not decoration
- Generous white space
- Clear visual hierarchy
- Distraction-free reading experience

**Fast & Responsive**:
- Mobile-first approach
- < 2 second load times
- Smooth transitions and animations
- Progressive enhancement

**Accessible & Inclusive**:
- WCAG 2.1 AA compliance
- High contrast ratios
- Keyboard navigation
- Screen reader friendly

---

## 2. Consumer Platform Wireframes

### 2.1 Homepage Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] DigitalTide          [Search]  [Menu]  [👤 Profile]     │
├─────────────────────────────────────────────────────────────────┤
│  🏠 Home  💡 Technology  💼 Business  🔬 Science  🌍 More ▼     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    HERO ARTICLE                           │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │                                                      │  │ │
│  │  │          [Featured Article Image]                  │  │ │
│  │  │                                                      │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │  Breaking News Badge                                      │ │
│  │  Headline: Large, Bold Title Here                        │ │
│  │  Excerpt: Brief summary of the article...                │ │
│  │  By Author Name • Technology • 5 min read • 2 hours ago  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │  TRENDING NOW    🔥  │  │  TODAY'S TOP    ⭐  │           │
│  ├──────────────────────┤  ├──────────────────────┤           │
│  │ 1. Article Title     │  │ [Image]              │           │
│  │    👁 12.5K  💬 45   │  │ Article Title        │           │
│  │                      │  │ Category • 3 min     │           │
│  │ 2. Article Title     │  ├──────────────────────┤           │
│  │    👁 10.2K  💬 32   │  │ [Image]              │           │
│  │                      │  │ Article Title        │           │
│  │ 3. Article Title     │  │ Category • 5 min     │           │
│  │    👁 9.8K   💬 28   │  └──────────────────────┘           │
│  └──────────────────────┘                                      │
│                                                                 │
│  LATEST ARTICLES                                    [View All] │
│  ─────────────────────────────────────────────────────────────│
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │ [Image]      │ [Image]      │ [Image]      │ [Image]      │ │
│  │ Article      │ Article      │ Article      │ Article      │ │
│  │ Title Here   │ Title Here   │ Title Here   │ Title Here   │ │
│  │ Category •   │ Category •   │ Category •   │ Category •   │ │
│  │ 4 min read   │ 3 min read   │ 6 min read   │ 5 min read   │ │
│  │ 1 hour ago   │ 2 hours ago  │ 3 hours ago  │ 4 hours ago  │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
│                                                                 │
│  DEEP DIVE: Technology                          [Explore More] │
│  ─────────────────────────────────────────────────────────────│
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ [Large Image]                                            │  │
│  │ Comprehensive Article Title: In-Depth Analysis           │  │
│  │ Extended excerpt providing detailed context...           │  │
│  │ 15 min read • Expert Analysis • 12 sources verified      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Load More Articles]                                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER                                                         │
│  About • Privacy • Terms • Contact • Newsletter Signup         │
│  © 2025 DigitalTide • AI-Powered News Platform                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Hero article with prominent image and headline
- Trending sidebar for popular content
- Grid layout for latest articles
- Category-specific deep dive sections
- Infinite scroll or pagination
- Sticky navigation bar

---

### 2.2 Article Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] DigitalTide    [Search]  [🔖 Save]  [👤 Profile]        │
├─────────────────────────────────────────────────────────────────┤
│  🏠 Home  >  Technology  >  Article Title                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐ │
│  │                         │  │  SIDEBAR                     │ │
│  │  [Article Hero Image]   │  │  ─────────────────────────── │ │
│  │                         │  │  TABLE OF CONTENTS           │ │
│  └─────────────────────────┘  │  1. Introduction             │ │
│                               │  2. Key Points               │ │
│  [Category Badge]             │  3. Analysis                 │ │
│  Article Headline:            │  4. Conclusion               │ │
│  Clear, Compelling Title      │                              │ │
│                               │  ─────────────────────────── │ │
│  By Author Name               │  SHARE THIS ARTICLE          │ │
│  Published: Oct 26, 2025      │  [Twitter] [Facebook]        │ │
│  Updated: Oct 26, 2025        │  [LinkedIn] [Email]          │ │
│  Reading time: 8 minutes      │  [Copy Link]                 │ │
│  👁 15.2K views • 💬 127      │                              │ │
│                               │  ─────────────────────────── │ │
│  ──────────────────────────   │  RELATED ARTICLES            │ │
│                               │  • Similar Article 1         │ │
│  [Lead paragraph in larger    │  • Similar Article 2         │ │
│   font size for emphasis]     │  • Similar Article 3         │ │
│                               │                              │ │
│  Article content begins here  │  ─────────────────────────── │ │
│  with clear typography and    │  TRENDING IN TECH            │ │
│  generous line spacing for    │  🔥 Hot Topic 1             │ │
│  comfortable reading...       │  🔥 Hot Topic 2             │ │
│                               │  🔥 Hot Topic 3             │ │
│  [Inline Image with Caption]  │                              │ │
│                               │  ─────────────────────────── │ │
│  More content here...         │  NEWSLETTER                  │ │
│                               │  📧 Get daily updates        │ │
│  ## Section Heading           │  [Email Input]               │ │
│  Section content...           │  [Subscribe Button]          │ │
│                               │                              │ │
│  > "Blockquote for emphasis   │  ─────────────────────────── │ │
│    and important statements"  │  AD SPACE                    │ │
│                               │  [Advertisement]             │ │
│  [Data Visualization/Chart]   │                              │ │
│                               └──────────────────────────────┘ │
│  Final paragraphs...                                          │
│                                                                 │
│  ──────────────────────────────────────────────────────────── │
│  SOURCES & FACT CHECKING                                       │
│  ✓ All facts verified from 5 credible sources                 │
│  1. Source Name - [Link to original]                          │
│  2. Source Name - [Link to original]                          │
│  3. Source Name - [Link to original]                          │
│  ──────────────────────────────────────────────────────────── │
│                                                                 │
│  TAGS: #AI #Technology #Innovation #News                       │
│                                                                 │
│  [👍 Helpful] [👎 Not Helpful] [🚩 Report Issue]              │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                                 │
│  COMMENTS (127)                           [Sort by: Recent ▼] │
│  ─────────────────────────────────────────────────────────────│
│  [Your comment...]                        [Post Comment]       │
│                                                                 │
│  👤 User Name                             2 hours ago          │
│  Great article! Very informative analysis...                   │
│  [👍 15] [💬 Reply] [⚠ Report]                                │
│     └─ 👤 Author Reply                    1 hour ago          │
│        Thanks for reading! Glad you found it helpful.          │
│                                                                 │
│  [Load More Comments]                                          │
│                                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                                 │
│  YOU MIGHT ALSO LIKE                                           │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │ [Image]      │ [Image]      │ [Image]      │ [Image]      │ │
│  │ Related      │ Related      │ Related      │ Related      │ │
│  │ Article 1    │ Article 2    │ Article 3    │ Article 4    │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Clean, distraction-free reading layout
- Table of contents for long articles
- Social sharing buttons
- Source attribution and fact-checking section
- Related articles sidebar
- Comment system with moderation
- Recommendation engine for "You might also like"

---

### 2.3 Category Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] DigitalTide          [Search]  [Menu]  [👤 Profile]     │
├─────────────────────────────────────────────────────────────────┤
│  🏠 Home  >  Technology                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  💡 TECHNOLOGY NEWS                                             │
│  Latest updates in tech, AI, software, and innovation          │
│                                                                 │
│  [Filter: All ▼] [Sort: Latest ▼] [View: Grid 📱 List 📋]     │
│  ─────────────────────────────────────────────────────────────│
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  FEATURED IN TECHNOLOGY                                   │ │
│  │  [Large Hero Image]                                       │ │
│  │  Featured Article Title: Breaking Tech News               │ │
│  │  Brief excerpt for featured content...                    │ │
│  │  8 min read • 30 minutes ago                              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────┬──────────────┬──────────────┐               │
│  │ [Image]      │ [Image]      │ [Image]      │               │
│  │ Article      │ Article      │ Article      │               │
│  │ Title        │ Title        │ Title        │               │
│  │ Excerpt...   │ Excerpt...   │ Excerpt...   │               │
│  │ 5 min • 1h   │ 4 min • 2h   │ 6 min • 3h   │               │
│  └──────────────┴──────────────┴──────────────┘               │
│                                                                 │
│  ┌──────────────┬──────────────┬──────────────┐               │
│  │ [Image]      │ [Image]      │ [Image]      │               │
│  │ Article      │ Article      │ Article      │               │
│  │ Title        │ Title        │ Title        │               │
│  │ Excerpt...   │ Excerpt...   │ Excerpt...   │               │
│  │ 3 min • 4h   │ 7 min • 5h   │ 5 min • 6h   │               │
│  └──────────────┴──────────────┴──────────────┘               │
│                                                                 │
│  [Load More] or [← 1 2 3 4 5 ... 10 →]                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Category header with description
- Filter and sort options
- Grid or list view toggle
- Featured article at top
- Pagination or infinite scroll
- Responsive grid layout

---

### 2.4 Search Results Page

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] DigitalTide          [Search: "AI technology"]  [×]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Search Results for "AI technology"                             │
│  Found 1,247 articles • Showing 1-20                           │
│                                                                 │
│  ┌─────────────────┐  ┌──────────────────────────────────────┐ │
│  │ FILTERS         │  │  RESULTS                              │ │
│  ├─────────────────┤  ├──────────────────────────────────────┤ │
│  │ CATEGORY        │  │  ┌────────┐  AI Technology Trends    │ │
│  │ ☐ Technology    │  │  │ [IMG]  │  Brief excerpt showing   │ │
│  │ ☐ Business      │  │  └────────┘  search term context...  │ │
│  │ ☐ Science       │  │              Technology • 5 min       │ │
│  │                 │  │              ★★★★☆ 250 views         │ │
│  │ DATE            │  ├──────────────────────────────────────┤ │
│  │ ⚫ Any time     │  │  ┌────────┐  Understanding AI in...   │ │
│  │ ○ Past hour     │  │  │ [IMG]  │  Another excerpt with    │ │
│  │ ○ Past 24h      │  │  └────────┘  highlighted keywords..  │ │
│  │ ○ Past week     │  │              Business • 8 min        │ │
│  │ ○ Past month    │  │              ★★★★★ 1.2K views       │ │
│  │                 │  ├──────────────────────────────────────┤ │
│  │ SORT BY         │  │  [More results...]                   │ │
│  │ ⚫ Relevance     │  │                                      │ │
│  │ ○ Date          │  │  [1] 2 3 4 ... 63 [Next →]          │ │
│  │ ○ Popularity    │  └──────────────────────────────────────┘ │
│  │                 │                                            │
│  │ [Clear All]     │                                            │
│  └─────────────────┘                                            │
│                                                                 │
│  SUGGESTED SEARCHES                                            │
│  • Machine learning basics                                     │
│  • AI ethics and regulation                                    │
│  • Artificial intelligence startups                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Search query with clear button
- Result count and range
- Left sidebar filters
- Result cards with relevance scoring
- Highlighted search terms in excerpts
- Pagination
- Suggested related searches

---

### 2.5 User Profile Page

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] DigitalTide          [Search]  [Menu]  [👤 Profile]     │
├─────────────────────────────────────────────────────────────────┤
│  🏠 Home  >  My Profile                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐  John Doe                                  │
│  │                │  john.doe@email.com                        │
│  │   [Avatar]     │  Member since: Jan 2025                    │
│  │                │  [Edit Profile] [Settings]                 │
│  └────────────────┘                                            │
│                                                                 │
│  ┌─── 📚 Reading List ────┬─── ❤ Favorites ────┬─── 📜 History ───┐
│  │  45 saved articles    │  12 favorites      │  238 articles   │
│  └───────────────────────┴────────────────────┴─────────────────┘
│                                                                 │
│  READING LIST (45)                              [View All]      │
│  ─────────────────────────────────────────────────────────────│
│  ┌──────────────┬──────────────┬──────────────┐               │
│  │ [Image]      │ [Image]      │ [Image]      │               │
│  │ Saved        │ Saved        │ Saved        │               │
│  │ Article 1    │ Article 2    │ Article 3    │               │
│  │ [×Remove]    │ [× Remove]   │ [× Remove]   │               │
│  └──────────────┴──────────────┴──────────────┘               │
│                                                                 │
│  READING PREFERENCES                                           │
│  ─────────────────────────────────────────────────────────────│
│  Favorite Topics:                                              │
│  [#Technology] [#AI] [#Science] [+ Add Topic]                 │
│                                                                 │
│  Newsletter Preferences:                                       │
│  ☑ Daily digest                                               │
│  ☑ Breaking news alerts                                       │
│  ☐ Weekly roundup                                             │
│                                                                 │
│  ACCOUNT SETTINGS                              [Manage →]      │
│  ─────────────────────────────────────────────────────────────│
│  • Change password                                             │
│  • Email preferences                                           │
│  • Privacy settings                                            │
│  • Delete account                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features**:
- User avatar and basic info
- Reading statistics
- Saved articles/bookmarks
- Reading history
- Favorite topics management
- Newsletter preferences
- Account settings

---

## 3. Admin Control Center Wireframes

### 3.1 Admin Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  ☰ Menu  DIGITALTIDE ADMIN               🔔(3)  [Admin Name ▼] │
├───────────┬─────────────────────────────────────────────────────┤
│           │  MISSION CONTROL DASHBOARD                          │
│ DASHBOARD │  Last updated: Just now                   [Refresh] │
│           │                                                      │
│ CONTENT   │  ┌─────────────┬─────────────┬─────────────┬──────┐│
│ • Articles│  │ ARTICLES    │ PAGE VIEWS  │ USERS       │ REV  ││
│ • Queue   │  │ 1,247       │ 2.4M        │ 45.2K       │ $12K ││
│ • Drafts  │  │ ↑ 12% today │ ↑ 8% today  │ ↑ 5% today  │ ↑ 3% ││
│           │  └─────────────┴─────────────┴─────────────┴──────┘│
│ AGENTS    │                                                      │
│ • Status  │  SYSTEM HEALTH                           [Details →]│
│ • Control │  ████████████████████░ 95% Healthy                  │
│ • Logs    │  • Crawler Agent: ✓ Running (12 sources)           │
│           │  • Writer Agent: ✓ Running (5 articles queued)     │
│ ANALYTICS │  • Publisher Agent: ✓ Running                       │
│ • Traffic │  • Quality Control: ⚠ Warning (high load)          │
│ • Revenue │                                                      │
│ • Users   │  REAL-TIME ACTIVITY              [Live Monitor →]   │
│           │  ┌──────────────────────────────────────────────┐  │
│ USERS     │  │ 📈 Active Visitors: 1,247 (↑)              │  │
│ • Manage  │  │ 📊 Current Articles Being Read: 328          │  │
│ • Roles   │  │ 🤖 AI Agents Active: 7/8                    │  │
│           │  │ ⚡ API Response Time: 85ms (avg)            │  │
│ SETTINGS  │  └──────────────────────────────────────────────┘  │
│ • Site    │                                                      │
│ • Security│  CONTENT PERFORMANCE                   [View All →] │
│ • API     │  ┌────────┬──────────────────────────────┬────────┐│
│           │  │ Rank   │ Article Title                │ Views  ││
│ REPORTS   │  ├────────┼──────────────────────────────┼────────┤│
│           │  │ 🥇 1   │ Breaking AI News...          │ 15.2K  ││
│           │  │ 🥈 2   │ Tech Industry Analysis...    │ 12.4K  ││
│           │  │ 🥉 3   │ Science Breakthrough...      │ 10.8K  ││
│           │  └────────┴──────────────────────────────┴────────┘│
│           │                                                      │
│           │  AGENT ACTIVITY                        [Monitor →]  │
│           │  ┌─────────────────────────────────────────────┐   │
│           │  │ 10:30 - Crawler: Discovered 25 new articles │   │
│           │  │ 10:28 - Writer: Published "AI Trends 2025"  │   │
│           │  │ 10:25 - QC: Flagged article for review      │   │
│           │  │ 10:22 - Publisher: Scheduled 3 articles     │   │
│           │  └─────────────────────────────────────────────┘   │
│           │                                                      │
└───────────┴──────────────────────────────────────────────────────┘
```

**Key Features**:
- Real-time metrics dashboard
- System health monitoring
- Agent status overview
- Live activity feed
- Top performing content
- Agent activity log
- Quick access navigation

---

### 3.2 Content Management

```
┌─────────────────────────────────────────────────────────────────┐
│  ☰ Menu  CONTENT MANAGEMENT                  [Admin Name ▼]    │
├───────────┬─────────────────────────────────────────────────────┤
│           │  ARTICLES                                            │
│ DASHBOARD │  [+ New Article] [Import] [Export] [Bulk Actions ▼]│
│           │                                                      │
│ CONTENT   │  [Search articles...] [Filter: All ▼] [Sort: Date ▼]│
│ • Articles│  ─────────────────────────────────────────────────  │
│ • Queue   │                                                      │
│ • Drafts  │  ☐ | Title              | Status  | Author | Date  │
│           │  ──┼────────────────────┼─────────┼────────┼────── │
│ AGENTS    │  ☐ | Breaking Tech News | ✓ Live  | AI Bot | 10:30 │
│           │  ☐ | AI Industry Update | 📝 Draft| Admin  | 10:15 │
│ ANALYTICS │  ☐ | Science Discovery  | ⏱ Queue | AI Bot | 10:00 │
│           │  ☐ | Business Analysis  | 🔍 Review| AI Bot | 09:45 │
│ USERS     │  ☐ | Market Trends 2025 | ❌ Reject| AI Bot | 09:30 │
│           │                                                      │
│ SETTINGS  │  [Select All] [Delete] [Publish] [Archive]         │
│           │  Showing 1-20 of 1,247 articles                     │
│ REPORTS   │  [← Prev] 1 2 3 4 5 ... 63 [Next →]               │
│           │                                                      │
│           │  ARTICLE DETAILS                         [Edit]     │
│           │  ┌──────────────────────────────────────────────┐  │
│           │  │ Title: Breaking Tech News                    │  │
│           │  │ Status: ✓ Published                          │  │
│           │  │ Category: Technology                         │  │
│           │  │ Tags: #AI #Tech #Innovation                  │  │
│           │  │ Published: Oct 26, 2025 10:30 AM            │  │
│           │  │ Views: 15,247 | Comments: 127               │  │
│           │  │ SEO Score: 92/100 ✓                         │  │
│           │  │ Fact-Check: ✓ Verified (5 sources)          │  │
│           │  │                                              │  │
│           │  │ [View Live] [Edit] [Unpublish] [Delete]     │  │
│           │  └──────────────────────────────────────────────┘  │
│           │                                                      │
└───────────┴──────────────────────────────────────────────────────┘
```

**Key Features**:
- Article listing with filters
- Bulk actions for multiple articles
- Status indicators (Published, Draft, Queue, Review, Rejected)
- Quick actions (Edit, Delete, Publish)
- Article details panel
- Performance metrics per article

---

### 3.3 Agent Control Center

```
┌─────────────────────────────────────────────────────────────────┐
│  ☰ Menu  AGENT ORCHESTRATION                [Admin Name ▼]     │
├───────────┬─────────────────────────────────────────────────────┤
│           │  AI AGENT CONTROL CENTER                            │
│ DASHBOARD │  [⏸ Pause All] [▶ Start All] [⚙ Configure]        │
│           │                                                      │
│ CONTENT   │  AGENT STATUS OVERVIEW                              │
│           │  ┌────────────────────────────────────────────────┐ │
│ AGENTS    │  │ COO ORCHESTRATOR                        [●]    │ │
│ • Status  │  │ Status: ✓ Active | CPU: 45% | Memory: 2.1GB   │ │
│ • Control │  │ Tasks Coordinated: 127 | Success Rate: 98.5%  │ │
│ • Logs    │  │ [View Logs] [Configure] [Restart]             │ │
│           │  └────────────────────────────────────────────────┘ │
│ ANALYTICS │                                                      │
│           │  ┌────────────────────────────────────────────────┐ │
│ USERS     │  │ CRAWLER AGENT                           [●]    │ │
│           │  │ Status: ✓ Active | Sources: 12 | Queue: 25    │ │
│ SETTINGS  │  │ Last Run: 2 min ago | Success Rate: 96%       │ │
│           │  │ [View Articles] [Configure] [Stop]            │ │
│ REPORTS   │  └────────────────────────────────────────────────┘ │
│           │                                                      │
│           │  ┌────────────────────────────────────────────────┐ │
│           │  │ WRITER AGENT                            [●]    │ │
│           │  │ Status: ✓ Active | Queue: 5 | In Progress: 2  │ │
│           │  │ Avg Quality Score: 87/100 | Speed: 8 min/art  │ │
│           │  │ [View Queue] [Configure] [Pause]              │ │
│           │  └────────────────────────────────────────────────┘ │
│           │                                                      │
│           │  ┌────────────────────────────────────────────────┐ │
│           │  │ QUALITY CONTROL AGENT                   [⚠]    │ │
│           │  │ Status: ⚠ Warning - High Load                 │ │
│           │  │ Review Queue: 15 | Avg Review Time: 3.2 min   │ │
│           │  │ [View Queue] [Allocate Resources] [Details]   │ │
│           │  └────────────────────────────────────────────────┘ │
│           │                                                      │
│           │  AGENT COMMUNICATION FLOW            [Visualize →] │
│           │  ┌────────────────────────────────────────────────┐ │
│           │  │  COO ──→ Crawler ──→ Research ──→ Writer      │ │
│           │  │            ↓           ↓           ↓           │ │
│           │  │         Quality ←── SEO ←─── Publisher        │ │
│           │  └────────────────────────────────────────────────┘ │
│           │                                                      │
│           │  RECENT AGENT ACTIVITY                              │
│           │  10:35 - Crawler: 25 articles discovered           │
│           │  10:32 - QC: Article flagged for review            │
│           │  10:30 - Writer: Article completed (Score: 92/100) │
│           │  10:28 - Publisher: Article published successfully │
│           │                                                      │
└───────────┴──────────────────────────────────────────────────────┘
```

**Key Features**:
- Individual agent status cards
- Real-time metrics per agent
- Quick actions (Start, Stop, Configure, Restart)
- Agent communication flow visualization
- Performance metrics and health indicators
- Activity feed
- Resource allocation controls

---

## 4. Responsive Design Breakpoints

### 4.1 Breakpoint Specifications

```
Mobile Small:  320px - 479px   (Vertical phones)
Mobile:        480px - 767px   (Horizontal phones)
Tablet:        768px - 1023px  (iPads, tablets)
Desktop:       1024px - 1439px (Laptops, small desktops)
Wide Desktop:  1440px+         (Large monitors)
```

### 4.2 Mobile Layout (320px - 767px)

```
┌───────────────────┐
│ [≡] DigitalTide   │
│        [Search 🔍]│
├───────────────────┤
│ [Hero Article]    │
│ ┌───────────────┐ │
│ │               │ │
│ │  [Big Image]  │ │
│ │               │ │
│ └───────────────┘ │
│ Headline Text     │
│ Excerpt...        │
│ 5 min • 1h ago    │
├───────────────────┤
│ Latest Articles   │
│ ┌───────────────┐ │
│ │ [Img] Title   │ │
│ │ Category • 3m │ │
│ └───────────────┘ │
│ ┌───────────────┐ │
│ │ [Img] Title   │ │
│ │ Category • 5m │ │
│ └───────────────┘ │
│                   │
│ [Load More]       │
└───────────────────┘
```

### 4.3 Tablet Layout (768px - 1023px)

```
┌─────────────────────────────┐
│ [Logo] DigitalTide  [Search]│
│ 🏠 Tech Business Science... │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │    [Hero Image]         │ │
│ │    Hero Article Title   │ │
│ └─────────────────────────┘ │
│                             │
│ ┌──────────┬──────────────┐│
│ │ [Image]  │  [Image]     ││
│ │ Article  │  Article     ││
│ │ Title    │  Title       ││
│ └──────────┴──────────────┘│
│                             │
└─────────────────────────────┘
```

---

## 5. Component Library

### 5.1 Article Card Component

```
┌────────────────────────┐
│  ┌──────────────────┐  │
│  │                  │  │
│  │  Article Image   │  │
│  │  (16:9 ratio)    │  │
│  │                  │  │
│  └──────────────────┘  │
│  [Category Badge]      │
│  Article Title Here    │
│  Goes Up To Two Lines  │
│  ─────────────────────│
│  Brief excerpt text... │
│  Author • 5 min • 2h   │
│  👁 1.2K 💬 45        │
└────────────────────────┘
```

### 5.2 Navigation Component

```
┌────────────────────────────────────────┐
│ [Logo] DigitalTide        [Search 🔍]  │
│ 🏠 Home 💡 Tech 💼 Business 🔬 Science │
│                     [Menu ≡] [👤 User] │
└────────────────────────────────────────┘
```

### 5.3 Button Styles

```
Primary:    [  Submit  ]   (Blue background)
Secondary:  [  Cancel  ]   (Gray background)
Outline:    [ View More ]  (Border only)
Text:       [ Learn More ] (No background)
Icon:       [  🔖 Save  ]  (With icon)
```

---

## 6. Color Scheme & Typography

### 6.1 Color Palette

```
Primary Colors:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brand Blue:     #1565C0  (Primary buttons, links)
Dark Blue:      #0D47A1  (Hover states)
Light Blue:     #E3F2FD  (Backgrounds)

Neutral Colors:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Text Dark:      #212121  (Primary text)
Text Medium:    #757575  (Secondary text)
Text Light:     #BDBDBD  (Disabled text)
Background:     #FFFFFF  (Main background)
Surface:        #F5F5F5  (Cards, panels)
Border:         #E0E0E0  (Dividers)

Accent Colors:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Success:        #43A047  (✓ Published, success states)
Warning:        #FB8C00  (⚠ Warnings, pending)
Error:          #E53935  (❌ Errors, delete)
Info:           #1E88E5  (ℹ Info, badges)
```

### 6.2 Typography

```
Font Family:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Headings:   'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Body:       'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Mono:       'Roboto Mono', 'Courier New', monospace

Font Sizes:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
H1: 2.5rem (40px)   - Page headlines
H2: 2rem (32px)     - Section headers
H3: 1.5rem (24px)   - Subsections
H4: 1.25rem (20px)  - Card titles
Body: 1rem (16px)   - Regular text
Small: 0.875rem (14px) - Meta info
Tiny: 0.75rem (12px)   - Labels

Font Weights:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Regular:    400
Medium:     500
Semi-Bold:  600
Bold:       700

Line Heights:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Headings:   1.2
Body:       1.6
Tight:      1.4
```

### 6.3 Spacing System

```
Base Unit: 4px (0.25rem)

Spacing Scale:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
xs:  4px   (0.25rem)  - Tight spacing
sm:  8px   (0.5rem)   - Small spacing
md:  16px  (1rem)     - Default spacing
lg:  24px  (1.5rem)   - Large spacing
xl:  32px  (2rem)     - Extra large
2xl: 48px  (3rem)     - Section spacing
3xl: 64px  (4rem)     - Major sections
```

### 6.4 Elevation (Shadows)

```
Elevation Levels:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Level 1 (Cards):
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

Level 2 (Hover):
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);

Level 3 (Dropdowns):
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);

Level 4 (Modals):
  box-shadow: 0 16px 32px rgba(0,0,0,0.25);
```

---

## Implementation Notes

### Priority Components:
1. **P1-CRITICAL**: Navigation, article cards, homepage layout
2. **P2-HIGH**: Article page, category pages, search
3. **P3-MEDIUM**: User profile, admin dashboard
4. **P4-LOW**: Advanced admin features

### Design Tools:
- Figma: High-fidelity mockups
- Adobe XD: Interactive prototypes
- Storybook: Component library
- Chromatic: Visual testing

### Accessibility Requirements:
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios 4.5:1 minimum
- Focus indicators
- Alt text for images

---

**Document Version**: 1.0  
**Last Updated**: October 26, 2025  
**Next Review**: January 26, 2026
