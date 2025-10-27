# DigitalTide - Content Strategy & Quality Framework

## Overview

This document defines the comprehensive content strategy, quality metrics, and testing framework for DigitalTide's AI-generated news content. These standards ensure high-quality, trustworthy, and engaging articles that meet both user expectations and SEO requirements.

## 1. Content Quality Metrics & Scoring System

### Quality Score Components

Each article receives a **Quality Score** (0-100) calculated from five key dimensions:

#### 1.1 Factual Accuracy (30 points)
```javascript
{
  "fact_check_score": 0-30,
  "criteria": {
    "source_credibility": 0-10,      // Tier 1 sources = 10pts, Tier 2 = 7pts, Tier 3 = 4pts
    "fact_verification": 0-10,       // Multi-source verification
    "claim_support": 0-10            // Evidence for claims made
  },
  "automated_checks": [
    "Source reputation scoring",
    "Cross-reference validation",
    "Claim-evidence matching"
  ]
}
```

**Implementation**:
- Source credibility from `sources.credibility_score` table
- Minimum 2 sources for any factual claim
- Claims flagged if only single-source support

#### 1.2 Readability & Engagement (25 points)
```javascript
{
  "readability_score": 0-25,
  "criteria": {
    "flesch_reading_ease": 0-10,     // Target: 60-70 (8th-9th grade)
    "sentence_structure": 0-8,        // Variety, clarity, flow
    "engagement_elements": 0-7        // Headlines, subheads, formatting
  },
  "metrics": {
    "avg_sentence_length": "15-20 words",
    "avg_paragraph_length": "3-5 sentences",
    "passive_voice_max": "10%",
    "adverb_usage_max": "5%"
  }
}
```

**Tools**:
- Flesch-Kincaid Grade Level
- Automated Readability Index (ARI)
- SMOG Index for complex text

#### 1.3 SEO Optimization (20 points)
```javascript
{
  "seo_score": 0-20,
  "criteria": {
    "keyword_optimization": 0-8,      // Target keyword density 1-2%
    "meta_quality": 0-7,              // Title, description, headers
    "internal_linking": 0-5           // Relevant article connections
  },
  "requirements": {
    "title_length": "50-60 characters",
    "meta_description": "150-160 characters",
    "h1_tags": "1 only",
    "h2_h3_tags": "3-7 total",
    "keyword_in_first_100_words": true,
    "alt_text_all_images": true
  }
}
```

#### 1.4 Originality & Uniqueness (15 points)
```javascript
{
  "originality_score": 0-15,
  "criteria": {
    "plagiarism_check": 0-10,         // <5% similarity = 10pts
    "unique_analysis": 0-5            // Original insights/angles
  },
  "thresholds": {
    "acceptable_similarity": "0-5%",
    "warning_similarity": "5-15%",
    "fail_similarity": ">15%"
  }
}
```

**Plagiarism Detection**:
- Copyscape API integration
- Grammarly plagiarism checker
- Internal database comparison

#### 1.5 Editorial Standards (10 points)
```javascript
{
  "editorial_score": 0-10,
  "criteria": {
    "grammar_spelling": 0-5,          // Zero tolerance for errors
    "brand_voice": 0-3,               // Consistency with style guide
    "attribution": 0-2                // Proper source citation
  },
  "automated_checks": [
    "Grammar validation (Grammarly API)",
    "Spell check (Hunspell)",
    "Citation format validation"
  ]
}
```

### Quality Score Thresholds

```yaml
Publication Requirements:
  Minimum Score: 70/100
  
Quality Tiers:
  Excellent (90-100):
    - Featured article placement
    - Social media promotion
    - Newsletter inclusion priority
  
  Good (75-89):
    - Standard publication
    - Homepage rotation eligible
    - Category featured potential
  
  Acceptable (70-74):
    - Publish with monitoring
    - Flag for editorial review
    - Track performance closely
  
  Below Standard (<70):
    - Hold for revision
    - Agent rewrite required
    - Human editorial intervention
```

## 2. Content Testing Framework

### 2.1 Sample Article Templates

#### Template 1: Breaking News Article (500-700 words)
```markdown
# [Action Verb] [Subject] [Outcome/Impact] - [Optional: Location/Context]

## Meta Description (150-160 chars)
[Who] [What] [When/Where] [Why it matters]

## Article Structure:
1. **Lead Paragraph** (50-75 words)
   - Who, What, When, Where, Why, How
   - Most important information first
   - Hook to keep reading

2. **Context & Background** (100-150 words)
   - Why this matters
   - Historical context
   - Related developments

3. **Details & Analysis** (200-300 words)
   - Key facts and data
   - Expert quotes (if available)
   - Multiple perspectives
   - Implications and impact

4. **What's Next** (50-100 words)
   - Future developments
   - Expected timeline
   - What to watch for

5. **Related Coverage** (50 words)
   - Links to 2-3 related articles
   - Background pieces
   - Topic overview pages
```

#### Template 2: Analysis/Deep Dive (1000-1500 words)
```markdown
# [Thought-Provoking Question] or [Bold Statement About Topic]

## Meta Description
[Complex issue] explained: [Key insight] and [what it means] for [audience]

## Article Structure:
1. **Introduction & Hook** (100-150 words)
   - Compelling question or statement
   - Why this matters now
   - What readers will learn

2. **Background & Context** (200-300 words)
   - Historical perspective
   - Current situation overview
   - Key players and stakeholders

3. **Analysis Section 1: [Subtopic]** (250-350 words)
   - In-depth examination
   - Data and evidence
   - Expert perspectives
   - Charts/graphs if applicable

4. **Analysis Section 2: [Subtopic]** (250-350 words)
   - Alternative viewpoints
   - Counter-arguments
   - Nuanced discussion

5. **Implications & Conclusions** (150-200 words)
   - What this means
   - Future outlook
   - Actionable insights

6. **Key Takeaways** (50-100 words)
   - Bullet-point summary
   - 3-5 key points
```

#### Template 3: How-To/Explainer (700-1000 words)
```markdown
# How to [Achieve Goal] or What You Need to Know About [Topic]

## Meta Description
Complete guide to [topic]: Learn [key benefit], avoid [common mistake], and [outcome]

## Article Structure:
1. **Introduction** (75-100 words)
   - Problem statement
   - What this guide covers
   - Who this is for

2. **Background/Why This Matters** (100-150 words)
   - Context and importance
   - Common misconceptions
   - What makes this challenging

3. **Step-by-Step Guide** (400-600 words)
   - **Step 1:** [Clear action]
   - **Step 2:** [Next action]
   - **Step 3:** [Following action]
   - Each step: 75-100 words
   - Use numbered lists
   - Include tips and warnings

4. **Common Mistakes to Avoid** (100-150 words)
   - Pitfall 1
   - Pitfall 2
   - Pitfall 3

5. **Conclusion & Next Steps** (50-75 words)
   - Summary of key points
   - Suggested next actions
   - Related resources
```

### 2.2 Content Type Classifications

```yaml
Content Categories:

Breaking News:
  Word Count: 300-700
  Update Frequency: Real-time to 30 minutes
  Sources Required: Minimum 2 verified
  Publication Speed: High priority
  Quality Threshold: 75+ (time-sensitive)

Analysis:
  Word Count: 1000-2000
  Update Frequency: Daily
  Sources Required: 3-5 expert/data sources
  Publication Speed: Standard
  Quality Threshold: 80+

Evergreen/How-To:
  Word Count: 800-1500
  Update Frequency: Weekly/as-needed
  Sources Required: Multiple authoritative
  Publication Speed: Low priority
  Quality Threshold: 85+

Opinion/Editorial:
  Word Count: 800-1200
  Update Frequency: 2-3x per week
  Sources Required: Supporting evidence needed
  Publication Speed: Standard
  Quality Threshold: 80+
  Note: Clearly marked as opinion

Roundup/List:
  Word Count: 600-1000
  Update Frequency: Weekly
  Sources Required: Per item listed
  Publication Speed: Low priority
  Quality Threshold: 75+
```

## 3. Fact-Checking Standards

### 3.1 Source Credibility Tiers

#### Tier 1: Premium Sources (Credibility Score: 0.90-1.00)
```yaml
Characteristics:
  - Established major news organizations
  - Peer-reviewed academic journals
  - Government/official data sources
  - Industry-leading publications

Examples:
  - Associated Press, Reuters, BBC
  - New York Times, Washington Post, Wall Street Journal
  - Nature, Science, JAMA
  - Government .gov domains
  - World Bank, WHO, CDC

Usage:
  - Preferred for all factual claims
  - Can be single-sourced for basic facts
  - Highest weighting in quality score
```

#### Tier 2: Reliable Sources (Credibility Score: 0.70-0.89)
```yaml
Characteristics:
  - Reputable regional/national news
  - Industry-specific publications
  - Well-known blogs with verification
  - Corporate press releases (fact-checked)

Examples:
  - The Guardian, NPR, PBS
  - TechCrunch, Ars Technica, The Verge
  - Industry trade publications
  - Verified company announcements

Usage:
  - Requires corroboration for major claims
  - Good for industry-specific details
  - Acceptable as secondary sources
```

#### Tier 3: Supplementary Sources (Credibility Score: 0.50-0.69)
```yaml
Characteristics:
  - Individual expert blogs
  - Social media (verified accounts)
  - Smaller publications
  - User-generated content platforms

Examples:
  - Medium articles by experts
  - Verified Twitter/X accounts
  - Reddit with high karma/verification
  - LinkedIn professional posts

Usage:
  - Never as sole source
  - Requires Tier 1/2 confirmation
  - Good for quotes, perspectives
  - Must attribute clearly
```

#### Unacceptable Sources (Do Not Use)
```yaml
Avoid:
  - Satirical websites (The Onion, etc.)
  - Conspiracy theory sites
  - Unverified social media
  - Content farms
  - Clickbait websites
  - Sites with known bias/misinformation history
```

### 3.2 Fact-Checking Process

```javascript
{
  "verification_workflow": {
    "step_1_claim_identification": {
      "action": "Extract all factual claims from article",
      "automated": true,
      "tool": "NLP claim extraction"
    },
    
    "step_2_source_verification": {
      "action": "Verify each claim has 2+ sources",
      "requirements": {
        "breaking_news": "2 Tier 1 sources OR 1 Tier 1 + 2 Tier 2",
        "standard_news": "2 Tier 1/2 sources",
        "analysis": "3+ sources, mixed tiers acceptable"
      }
    },
    
    "step_3_cross_reference": {
      "action": "Compare facts across sources",
      "flags": [
        "Contradictory information",
        "Missing verification",
        "Outdated data",
        "Single-source only"
      ]
    },
    
    "step_4_expert_validation": {
      "action": "For technical/medical/legal content",
      "requirements": "Expert source or peer-reviewed reference",
      "trigger": "Content flagged as specialized"
    },
    
    "step_5_confidence_scoring": {
      "high_confidence": "3+ Tier 1 sources agree",
      "medium_confidence": "2 Tier 1/2 sources, no contradictions",
      "low_confidence": "Single source or mixed messages",
      "action_low": "Flag for human review or additional research"
    }
  }
}
```

### 3.3 Claim Attribution Standards

```markdown
## Attribution Requirements:

### Direct Quotes
- Must include: Speaker name, title/organization, exact quote, source link
- Format: "Quote text," said [Full Name], [Title] at [Organization] in [Source].
- Example: "AI will transform healthcare," said Dr. Jane Smith, Chief of Medicine at Stanford Hospital, in an interview with Reuters.

### Paraphrased Information
- Attribute to source organization
- Include link in text or references
- Example: According to a report by the World Health Organization, global cases increased by 15% last month.

### Statistical Data
- Source organization + publication date + link
- Example: GDP grew 2.3% in Q3 2025 (Bureau of Economic Analysis, October 2025).

### Background/Common Knowledge
- No attribution needed for widely known facts
- Examples: "The Earth orbits the Sun" or "Water boils at 100°C"
```

## 4. Article Templates by Content Type

### 4.1 Technology News Template

```markdown
---
category: Technology
subcategory: [AI/Software/Hardware/Gadgets/Cybersecurity]
target_word_count: 600-900
reading_level: 8th-10th grade
update_frequency: 2-4 hours (for trending topics)
---

# [Tech Company/Product] [Action Verb] [Innovation/Feature]: What It Means for [Users/Industry]

## Quick Summary (50 words)
[Company] announced [what] that [impact]. This development [why it matters] and could [future implications].

## The Announcement
[What was announced, when, by whom]
[Key features/specifications]
[Official quotes from announcement]

## Why This Matters
[Industry context]
[Competitive landscape]
[User impact]

## Technical Details
[How it works - simplified for general audience]
[Specifications/performance metrics]
[Comparison to existing solutions]

## Market Impact
[Pricing/availability]
[Target audience]
[Competitor response expected]

## What's Next
[Release timeline]
[Future developments]
[What to watch]

## Related Coverage
- [Link to background article]
- [Link to company profile]
- [Link to industry analysis]
```

### 4.2 Business/Finance Template

```markdown
---
category: Business
subcategory: [Markets/Startups/Economy/Corporate]
target_word_count: 700-1000
reading_level: 10th-12th grade
update_frequency: 1-2 hours (market hours)
---

# [Company/Market] [Gains/Falls/Announces] [Percentage/Amount/News] as [Reason/Context]

## Market Snapshot
[Current price/value]
[Change percentage and amount]
[Time frame context]

## What Happened
[Event description]
[Timeline of developments]
[Key players involved]

## Analysis
[Why this occurred]
[Market conditions]
[Expert perspectives]
[Historical context]

## Implications
**For Investors:** [Investment angle]
**For Industry:** [Competitive impact]
**For Economy:** [Broader significance]

## By the Numbers
- [Key statistic 1]
- [Key statistic 2]
- [Key statistic 3]
[Data visualization description]

## What Analysts Say
[Quote from financial analyst 1]
[Quote from industry expert 2]
[Consensus view]

## Looking Ahead
[Expected developments]
[What to monitor]
[Potential outcomes]
```

### 4.3 Science/Health Template

```markdown
---
category: Science
subcategory: [Health/Space/Environment/Research]
target_word_count: 800-1200
reading_level: 9th-11th grade
update_frequency: Daily
---

# Scientists [Discover/Develop/Find] [Innovation] That Could [Impact]

## Key Finding
[Main discovery in plain language]
[Why this is significant]
[Who conducted the research]

## The Research
**Study Details:**
- Published in: [Journal name]
- Research team: [Institution/scientists]
- Study size: [Participants/scope]
- Methodology: [How it was done - simplified]

## What They Found
[Primary findings]
[Supporting evidence]
[Statistical significance]

## What This Means
**For Patients/Public:** [Practical implications]
**For Medical Field:** [Professional impact]
**For Science:** [Research advancement]

## Expert Perspectives
[Quote from lead researcher]
[Quote from independent expert]
[Quote from relevant organization]

## Important Caveats
[Limitations of the study]
[What this doesn't prove]
[Need for further research]

## Next Steps
[Follow-up research planned]
[Timeline for applications]
[What needs to happen before implementation]

## Background
[Previous research in this area]
[How this builds on existing knowledge]
[Related developments]
```

## 5. Content Moderation Guidelines

### 5.1 Prohibited Content

```yaml
Absolute Prohibitions:
  - Hate speech or discrimination
  - Explicit violence or gore
  - Sexual content
  - Illegal activities or instructions
  - Malware/phishing links
  - Doxing or personal information exposure
  - Intentional misinformation
  - Copyright infringement

Editorial Restrictions:
  - Unverified rumors presented as fact
  - Sensationalized misleading headlines
  - One-sided political advocacy
  - Personal attacks on individuals
  - Medical advice (vs. medical information)
  - Financial advice (vs. financial information)
```

### 5.2 Automated Content Checks

```javascript
{
  "pre_publication_checks": [
    {
      "check": "profanity_filter",
      "action": "Flag for review",
      "exceptions": "Quotes in context"
    },
    {
      "check": "bias_detection",
      "tools": ["Perspective API", "Custom NLP models"],
      "threshold": "Toxicity score < 0.3"
    },
    {
      "check": "sensitive_topics",
      "keywords": ["suicide", "self-harm", "violence"],
      "action": "Require human editorial review"
    },
    {
      "check": "legal_compliance",
      "scans": ["Copyright claims", "Trademark usage", "Defamation risk"],
      "action": "Legal team review if flagged"
    },
    {
      "check": "medical_claims",
      "requirements": "Peer-reviewed source required",
      "disclaimer": "Add medical disclaimer if health advice implied"
    }
  ]
}
```

## 6. SEO Standards & Scoring

### 6.1 On-Page SEO Requirements

```yaml
Title Tag:
  Length: 50-60 characters
  Format: [Primary Keyword] - [Benefit/Context] | DigitalTide
  Requirements:
    - Primary keyword in first 5 words
    - Action word or power word
    - Brand name at end
  Example: "AI Transforms Healthcare - New Study Shows 40% Improvement | DigitalTide"

Meta Description:
  Length: 150-160 characters
  Format: [Hook] [Key info] [Call-to-action/benefit]
  Requirements:
    - Include primary keyword
    - Compelling reason to click
    - Accurate preview of content
  Example: "Breakthrough AI system diagnosed diseases 40% faster in clinical trials. Learn how this technology will change patient care and save lives."

URL Structure:
  Format: /category/yyyy/mm/seo-friendly-title
  Requirements:
    - Lowercase only
    - Hyphens for spaces
    - Primary keyword included
    - No stop words (the, a, an)
    - Max 5-7 words
  Example: /technology/2025/10/ai-healthcare-diagnosis-breakthrough

Header Tags:
  H1: 1 per article (same as title or variation)
  H2: 3-5 major sections
  H3: Sub-sections as needed
  Requirements:
    - Logical hierarchy
    - Keywords in 60% of headers
    - Descriptive, not generic
```

### 6.2 Content SEO Requirements

```yaml
Keyword Strategy:
  Primary Keyword:
    Density: 1-2% of total words
    Placement: Title, first paragraph, conclusion, 2-3 subheadings
    
  Secondary Keywords (2-4):
    Density: 0.5-1% each
    Placement: Naturally throughout content
    
  LSI Keywords (5-10):
    Usage: Related terms and synonyms
    Purpose: Semantic relevance
    
Internal Linking:
  Minimum: 3-5 relevant article links
  Maximum: 10 links
  Requirements:
    - Contextually relevant
    - Natural anchor text (no "click here")
    - Mix of recent and evergreen content
    - Link to category pages
    
External Linking:
  Sources: 2-4 authoritative external links
  Requirements:
    - Open in new tab
    - Nofollow if sponsored/untrusted
    - Verify links active before publication
    
Image Optimization:
  Alt Text: Descriptive with keyword (if natural)
  File Name: descriptive-with-hyphens.jpg
  Size: <200KB for web, <50KB thumbnails
  Format: WebP preferred, JPEG fallback
  Dimensions: 1200x630 for featured (social sharing)
```

### 6.3 Technical SEO Checklist

```yaml
Per-Article Technical Requirements:
  - Mobile-responsive design
  - Page load time <3 seconds
  - Core Web Vitals: Green scores
  - Schema markup (Article, NewsArticle, or BlogPosting)
  - OpenGraph tags for social sharing
  - Twitter Card tags
  - Canonical URL specified
  - Sitemap updated automatically
  - No broken links (internal or external)
  - HTTPS enabled
  - Structured data validation passed
```

## 7. Content Performance Benchmarks

### 7.1 Success Metrics by Content Type

```yaml
Breaking News:
  - Time to publish: <30 minutes from event
  - Initial traffic: 500+ views in first hour
  - Social shares: 50+ in first 24 hours
  - Engagement rate: >40% scroll depth
  - Bounce rate: <50%

Analysis/Deep Dive:
  - Average time on page: >5 minutes
  - Read completion: >60%
  - Social shares: 100+ in first week
  - Comments/engagement: 10+ quality comments
  - Return visitors: 20%+ from this article

Evergreen Content:
  - Monthly traffic: 1,000+ views after 3 months
  - Search rankings: Top 10 for target keywords
  - Sustained traffic: <20% monthly decline
  - Internal link clicks: 25%+ CTR
  - Long-term shares: Consistent sharing over time
```

### 7.2 Quality KPIs

```yaml
Overall Quality Targets:
  - Average quality score: >80/100
  - Publication rate: >95% of articles pass threshold
  - Revision rate: <10% require rewrites
  - Fact-check accuracy: >98% verified claims
  - Plagiarism incidents: 0 per month
  - Reader complaints: <1 per 1000 articles

SEO Performance:
  - Organic traffic growth: +10% month-over-month
  - Average position: Top 20 for target keywords
  - Click-through rate: >3% from search
  - Featured snippets: 5%+ of articles
  - Backlinks: Average 2+ per article within 6 months

Engagement Metrics:
  - Average time on site: >3 minutes
  - Pages per session: >2.5
  - Bounce rate: <45%
  - Return visitor rate: >30%
  - Social engagement: 5%+ share rate
```

## 8. Content Calendar & Planning

### 8.1 Content Mix Guidelines

```yaml
Weekly Content Distribution:

Breaking News: 40-50%
  - 15-20 articles
  - Published throughout day
  - High-frequency updates

Analysis/Commentary: 20-25%
  - 5-8 articles
  - Published mornings/early afternoon
  - Research-heavy pieces

How-To/Guides: 15-20%
  - 4-6 articles
  - Published mid-week optimal
  - Evergreen focus

Industry Roundups: 10-15%
  - 3-5 articles
  - Weekly/bi-weekly series
  - Topic summaries

Trending Topics: 10%
  - 2-4 articles
  - Opportunistic coverage
  - Social listening driven
```

## 9. Continuous Improvement Process

### 9.1 Content Performance Review

```yaml
Daily Review:
  - Monitor quality scores
  - Track publication metrics
  - Flag underperforming content
  - Identify trending topics

Weekly Analysis:
  - Top/bottom performing articles
  - Content mix effectiveness
  - Source quality audit
  - SEO performance review

Monthly Deep Dive:
  - Quality score trends
  - Agent performance analysis
  - Content strategy adjustments
  - Competitive benchmark comparison

Quarterly Strategic Review:
  - Overall content health
  - Major strategy shifts
  - New content types/templates
  - Technology upgrades
```

### 9.2 Agent Learning Integration

```yaml
Feedback Loop:
  - Performance data → Agent training
  - User engagement → Content preferences
  - SEO results → Keyword strategy
  - Quality scores → Writing improvements

Continuous Optimization:
  - A/B test headlines
  - Experiment with formats
  - Refine templates based on data
  - Update quality algorithms
```

---

## Implementation Checklist

- [ ] Set up quality scoring database schema
- [ ] Integrate plagiarism detection API
- [ ] Configure readability analysis tools
- [ ] Implement fact-checking workflow
- [ ] Create article template library
- [ ] Build automated content checks
- [ ] Set up performance tracking dashboards
- [ ] Train AI agents on quality standards
- [ ] Establish human review process
- [ ] Create content moderation queue
- [ ] Implement SEO validation automation
- [ ] Set up A/B testing framework

---

**Document Version**: 1.0  
**Last Updated**: October 27, 2025  
**Next Review**: November 27, 2025
