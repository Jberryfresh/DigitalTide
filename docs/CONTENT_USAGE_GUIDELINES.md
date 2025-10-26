# Content Usage Guidelines

**Version**: 1.0  
**Last Updated**: October 26, 2025  
**Applies To**: All DigitalTide AI agents, developers, and content systems

---

## Purpose

This document establishes clear guidelines for how DigitalTide's AI agents should source, use, attribute, and present news content. These guidelines ensure legal compliance, ethical operation, and respect for original publishers while maintaining our platform's value proposition.

---

## Table of Contents

1. [Guiding Principles](#1-guiding-principles)
2. [News Source Criteria](#2-news-source-criteria)
3. [Content Acquisition Methods](#3-content-acquisition-methods)
4. [Content Transformation Standards](#4-content-transformation-standards)
5. [Attribution Requirements](#5-attribution-requirements)
6. [Prohibited Practices](#6-prohibited-practices)
7. [Fair Use Guidelines](#7-fair-use-guidelines)
8. [Quality Control](#8-quality-control)
9. [Update and Correction Policy](#9-update-and-correction-policy)
10. [Enforcement and Monitoring](#10-enforcement-and-monitoring)

---

## 1. Guiding Principles

### 1.1 Core Values

**Respect for Original Publishers**:
- We honor the intellectual property rights of news publishers
- We drive traffic back to original sources through attribution
- We use content in ways that add value, not substitute for originals

**Transparency**:
- We clearly identify AI-generated content
- We disclose our sources and methodology
- We distinguish between aggregated excerpts and original analysis

**Legal Compliance**:
- We operate within fair use doctrine limits
- We comply with copyright law and licensing terms
- We honor DMCA takedown requests promptly

**Quality Over Quantity**:
- We prioritize credible sources over volume
- We verify information from multiple sources
- We correct errors quickly and transparently

### 1.2 Value Addition

DigitalTide provides value through:
- **Synthesis**: Combining multiple perspectives on the same story
- **Analysis**: AI-powered insights and context
- **Organization**: Categorizing and connecting related stories
- **Personalization**: Tailoring content to user interests
- **Discovery**: Surfacing lesser-known but important stories

We do NOT simply republish entire articles verbatim.

---

## 2. News Source Criteria

### 2.1 Approved Source Types

**Tier 1: Licensed API Sources** (Preferred)
- Google News API
- NewsAPI.org
- MediaStack API
- Other commercial news aggregation APIs
- **Usage**: Follow API terms of service explicitly
- **Attribution**: Per API provider requirements
- **Limits**: Respect rate limits and usage quotas

**Tier 2: RSS Feeds**
- Publicly available RSS/Atom feeds
- Official publisher feeds (not third-party)
- Feeds marked as public and unrestricted
- **Usage**: Limited to headline, summary, link
- **Attribution**: Required for all excerpts
- **Limits**: No full-text scraping

**Tier 3: Public APIs with Terms**
- Twitter/X API (for breaking news)
- Reddit API (for trending topics)
- Official government feeds (press releases, public data)
- **Usage**: Follow platform terms strictly
- **Attribution**: Per platform requirements
- **Limits**: Respect platform policies

### 2.2 Source Credibility Assessment

All sources must be evaluated for:

**Reputation**:
- Established news organizations
- Professional journalists
- Fact-checking track record
- Industry recognition

**Transparency**:
- Clear authorship and editorial standards
- Corrections policy
- Contact information
- About/disclaimer pages

**Accuracy History**:
- Minimal retractions
- No history of fabrication
- Credible fact-checking ratings (e.g., IFCN certified)

**Prohibited Sources**:
- Known misinformation websites
- Satirical news presented as factual
- Sites violating copyright systematically
- Extremist or hate speech platforms
- Sites with malicious code or scams

### 2.3 Source Database

Maintain a database with:
- Source ID and name
- Source URL and RSS feed
- Credibility rating (1-5 scale)
- License type (public RSS, API licensed, etc.)
- Attribution requirements
- Last credibility review date
- Notes on past issues

**Review Schedule**: Quarterly credibility audits for all sources.

---

## 3. Content Acquisition Methods

### 3.1 Approved Methods

**Method 1: Licensed APIs** ✅
```
✓ Commercial news aggregation APIs
✓ Follow all terms of service
✓ Track usage against quotas
✓ Store API keys securely
```

**Method 2: Public RSS Feeds** ✅
```
✓ Use official publisher RSS feeds
✓ Respect robots.txt and meta tags
✓ Limit to headline, summary, link
✓ Request full-text permission if needed
```

**Method 3: Publisher Partnerships** ✅
```
✓ Direct licensing agreements
✓ Negotiated terms and attribution
✓ Written contracts on file
✓ Potential revenue sharing
```

**Method 4: User-Generated Content** ✅
```
✓ Comments, posts, discussions
✓ User grants license in Terms of Service
✓ Moderation for quality and legality
```

### 3.2 Prohibited Methods

**Web Scraping Without Permission** ❌
```
✗ Bypassing paywalls or authentication
✗ Ignoring robots.txt or meta noindex tags
✗ Scraping full articles from websites
✗ Using bots that masquerade as users
```

**Unauthorized Redistribution** ❌
```
✗ Copying entire articles verbatim
✗ Removing copyright notices
✗ Reposting behind our own paywall
✗ Claiming authorship of others' work
```

**Deceptive Practices** ❌
```
✗ Cloaking or fake user agents
✗ CAPTCHA bypass attempts
✗ Distributed scraping to evade detection
✗ Exploiting vulnerabilities
```

### 3.3 Acquisition Process

**Step 1: Source Selection**
- Identify relevant, credible sources
- Verify licensing and terms
- Check credibility rating

**Step 2: Content Retrieval**
- Use approved methods only
- Respect rate limits
- Log all acquisitions

**Step 3: Initial Processing**
- Extract headline, summary, link
- Capture publication date and author
- Store source metadata

**Step 4: Verification**
- Check for duplicates
- Verify links are active
- Flag suspicious content

---

## 4. Content Transformation Standards

### 4.1 Aggregated Content (From Sources)

**Headlines**:
- Use original headlines when possible
- If rewriting for clarity, maintain meaning
- Never sensationalize or mislead
- Attribute source in headline if modified

**Summaries/Excerpts**:
- Limit to 150-200 words maximum
- Use quotation marks for direct quotes
- Include ellipsis (...) for omissions
- Preserve context and meaning
- Include "Read more at [Source]" link

**Example**:
```markdown
## Biden Announces Infrastructure Plan
*From: The New York Times | March 31, 2021*

President Biden unveiled a $2 trillion infrastructure plan aimed at repairing roads, bridges, and broadband networks... "This is a once-in-a-generation investment in America," Biden stated during the announcement.

[Read the full article at The New York Times →](https://example.com)
```

### 4.2 AI-Generated Analysis

**Original Commentary**:
- Clearly label as "DigitalTide Analysis"
- Base on multiple source verification
- Distinguish fact from opinion
- Cite sources for factual claims

**Synthesis Articles**:
- Combine perspectives from 3+ sources
- Compare and contrast viewpoints
- Identify consensus and disagreements
- Provide balanced representation

**Structure**:
```markdown
# [Headline]
**DigitalTide Analysis** | [Date]

[Introduction explaining the topic]

## What Happened
[Factual summary from sources]

## Different Perspectives
**Source A says**: [Summary with attribution]
**Source B says**: [Summary with attribution]
**Source C says**: [Summary with attribution]

## Context and Analysis
[AI-generated insights, clearly labeled]

## What This Means
[Implications and significance]

---
**Sources**:
- [Source 1 with link]
- [Source 2 with link]
- [Source 3 with link]
```

### 4.3 Transformative Use Guidelines

For fair use protection, ensure content is **transformative**:

**Acceptable Transformations**:
- Summarizing multiple sources on a topic
- Providing analysis or commentary
- Comparing different perspectives
- Adding context or background
- Correcting misinformation with facts
- Organizing by theme or topic
- Translating with attribution

**Non-Transformative (Avoid)**:
- Reproducing entire articles
- Minor rewording without analysis
- Simply changing formatting
- Aggregating for aggregation's sake

### 4.4 Language and Tone

**Maintain Neutrality**:
- Avoid partisan language
- Present multiple viewpoints
- Distinguish news from opinion
- Disclose AI generation

**Professional Standards**:
- Use clear, accessible language
- Avoid sensationalism
- No clickbait headlines
- Fact-check before publication

**Accessibility**:
- Use plain language when possible
- Define technical terms
- Structure content with headings
- Provide alt text for images

---

## 5. Attribution Requirements

### 5.1 Mandatory Attribution Elements

Every piece of sourced content must include:

**1. Source Name**:
- Full publication name (e.g., "The Washington Post")
- Not just domain (e.g., not just "washingtonpost.com")

**2. Article Title**:
- Original headline or article title
- Linked to source URL

**3. Author** (if available):
- Individual author name(s)
- Or "Staff Report" / "Editorial Board"

**4. Publication Date**:
- Original publication date
- Update date if significantly different

**5. Direct Link**:
- Clickable link to original article
- No affiliate codes or tracking (unless publisher agreement)
- Use original URL, not shortened

### 5.2 Attribution Formats

**Standard Format**:
```html
<article class="sourced-content">
  <h2><a href="[ORIGINAL_URL]">[Article Title]</a></h2>
  <p class="attribution">
    By [Author] | 
    <a href="[SOURCE_HOMEPAGE]">[Publication Name]</a> | 
    [Publication Date]
  </p>
  <p class="excerpt">[Summary/Excerpt]</p>
  <a href="[ORIGINAL_URL]" class="read-more">Read full article →</a>
</article>
```

**Minimal Format** (for lists):
```html
<li>
  <a href="[URL]">[Title]</a>
  <span class="source">— [Publication], [Date]</span>
</li>
```

**AI Analysis Format**:
```html
<article class="ai-generated">
  <h2>[Our Analysis Title]</h2>
  <p class="byline">DigitalTide Analysis | [Date]</p>
  
  [Content body with inline citations]
  
  <section class="sources">
    <h3>Sources:</h3>
    <ul>
      <li><a href="[URL1]">[Title 1]</a> — [Publication 1], [Date]</li>
      <li><a href="[URL2]">[Title 2]</a> — [Publication 2], [Date]</li>
      <li><a href="[URL3]">[Title 3]</a> — [Publication 3], [Date]</li>
    </ul>
  </section>
</article>
```

### 5.3 Special Cases

**Multiple Authors**:
```
By Jane Doe, John Smith, and Mary Johnson | The Guardian | March 15, 2025
```

**No Author Listed**:
```
Staff Report | Reuters | March 15, 2025
```

**Wire Service**:
```
Associated Press (via Los Angeles Times) | March 15, 2025
```

**Press Release**:
```
Company Name Press Release | March 15, 2025
[Note: This is promotional content]
```

**User-Generated Content**:
```
User: @username | Posted on DigitalTide | March 15, 2025
[Disclaimer: User-generated content reflects author's views only]
```

### 5.4 SEO and Metadata

Include proper attribution in metadata:

```html
<head>
  <meta property="og:site_name" content="DigitalTide">
  <meta property="article:author" content="[Original Author]">
  <meta property="article:publisher" content="[Original Publication]">
  <meta name="news_keywords" content="[Topics]">
  
  <!-- JSON-LD structured data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "[Title]",
    "author": {
      "@type": "Person",
      "name": "[Author Name]"
    },
    "publisher": {
      "@type": "Organization",
      "name": "[Original Publication]"
    },
    "isBasedOn": "[Original Article URL]",
    "datePublished": "[ISO Date]"
  }
  </script>
</head>
```

---

## 6. Prohibited Practices

### 6.1 Content Theft

**Never**:
- Copy entire articles without permission
- Remove or obscure copyright notices
- Claim authorship of others' work
- Republish premium/paywalled content
- Use content beyond fair use limits

### 6.2 Misleading Attribution

**Never**:
- Attribute content to wrong source
- Omit required attribution
- Use misleading or vague attribution ("sources say")
- Imply original reporting when aggregating
- Hide AI generation when it applies

### 6.3 Manipulation

**Never**:
- Alter quotes or change meaning
- Cherry-pick to misrepresent source
- Combine quotes from different contexts
- Add words to quotes without brackets
- Use misleading ellipses

### 6.4 SEO Manipulation

**Never**:
- Copy full articles to steal search traffic
- Use competitor brand names as keywords
- Publish duplicate content
- Use hidden text or cloaking
- Engage in link schemes

### 6.5 API/Terms Violations

**Never**:
- Exceed API rate limits
- Share API keys or access
- Violate platform terms of service
- Cache beyond permitted time
- Redistribute API data improperly

---

## 7. Fair Use Guidelines

### 7.1 Four Fair Use Factors

When using copyrighted material without permission, evaluate:

**1. Purpose and Character**:
- ✓ Transformative (commentary, analysis, news reporting)
- ✓ Non-commercial or educational
- ✗ Simply republishing for traffic
- ✗ Commercial exploitation without transformation

**2. Nature of Copyrighted Work**:
- ✓ Factual news articles (more fair use protection)
- ✗ Creative or highly original works (less protection)
- ✓ Published works (vs. unpublished)

**3. Amount and Substantiality**:
- ✓ Small excerpts (150-200 words)
- ✓ Only what's necessary for purpose
- ✗ Entire articles or "heart" of the work
- ✗ Multiple full excerpts from same source

**4. Effect on Market**:
- ✓ Drives traffic to original (market enhancement)
- ✓ Provides complementary value (not substitution)
- ✗ Reduces need to visit original
- ✗ Harms publisher's revenue

### 7.2 Safe Fair Use Practices

**For News Aggregation**:
- Use only headline + brief summary (under 200 words)
- Always link to original article
- Focus on factual reporting (not creative writing)
- Serve a transformative purpose (e.g., comparison, context)

**For AI Analysis**:
- Use multiple sources (not single article)
- Add substantial original commentary
- Transform the content (synthesize, analyze)
- Cite sources transparently

**For Criticism/Commentary**:
- Quote only portions necessary for analysis
- Clearly distinguish your commentary from source
- Serve educational or transformative purpose

### 7.3 When to Seek Permission

Seek explicit permission when:
- Using substantial portions of an article
- Using creative works (photos, videos, artwork)
- Using content from small publishers (potential market harm)
- Using paywalled or premium content
- Uncertain about fair use application
- Publisher has explicit "no aggregation" policy

---

## 8. Quality Control

### 8.1 Pre-Publication Checks

**Content Review**:
- [ ] Source is credible and approved
- [ ] Attribution is complete and correct
- [ ] Links are active and correct
- [ ] Excerpts are within fair use limits
- [ ] Quotes are accurate and in context
- [ ] AI-generated content is labeled
- [ ] Multiple sources verified (for original content)
- [ ] No prohibited sources used

**Legal Compliance**:
- [ ] Copyright respected
- [ ] Attribution complete
- [ ] No trademark infringement
- [ ] No defamatory statements
- [ ] Privacy respected (no doxxing)
- [ ] No hate speech or illegal content

**Quality Standards**:
- [ ] Headline is accurate (not clickbait)
- [ ] Content is relevant and timely
- [ ] Language is clear and professional
- [ ] Formatting is consistent
- [ ] Images have alt text
- [ ] Metadata is complete

### 8.2 Post-Publication Monitoring

**Daily**:
- Review most-read articles for compliance
- Check for DMCA notices or complaints
- Monitor for broken links
- Review user-reported content

**Weekly**:
- Audit random sample of articles (10%)
- Review attribution accuracy
- Check source link quality
- Analyze traffic patterns (detect unusual)

**Monthly**:
- Comprehensive compliance audit
- Source credibility review
- Update source database
- Review fair use practices

### 8.3 Human Oversight

**Editorial Review**:
- AI-generated content reviewed by human editors before publication
- Sensitive topics require additional review
- Breaking news verified from multiple sources
- User reports investigated within 24 hours

**Escalation Process**:
- Content flagged by AI → Reviewed by editor
- Legal concerns → Reviewed by legal counsel
- DMCA notices → Immediate review and action
- User complaints → Investigated within 48 hours

---

## 9. Update and Correction Policy

### 9.1 When to Update

Update content when:
- New significant information emerges
- Errors are discovered
- Sources issue corrections
- Context changes substantially

### 9.2 How to Update

**Minor Updates** (clarifications, typos):
```
[Updated March 15, 2025, 3:45 PM EST: Corrected spelling of official's name]
```

**Significant Updates** (new information):
```
**Update (March 15, 2025, 4:00 PM EST):** 
Officials have confirmed that the incident affected 100,000 users, 
not 10,000 as originally reported.
```

**Major Corrections**:
```
**Correction (March 15, 2025):**
An earlier version of this article incorrectly stated that the policy 
would take effect in January. It will take effect in July. We regret the error.

[Original text remains visible with strikethrough if significant]
```

### 9.3 Correction Standards

**Transparency**:
- Clearly label corrections
- Explain what was wrong
- Include timestamp
- Don't delete or hide original (if significant)

**Timeliness**:
- Correct errors as soon as discovered
- Prioritize by severity and visibility
- High-traffic articles corrected within 1 hour
- Minor errors corrected within 24 hours

**User Notifications**:
- Notify users who saved/shared incorrect article
- Issue correction on same channels as original
- Update social media posts

### 9.4 Retraction Policy

**When to Retract**:
- Fundamental errors that invalidate the article
- Content based on fabricated sources
- Major ethical violations
- Irreparable legal issues

**Retraction Process**:
1. Remove article from public view
2. Replace with retraction notice explaining why
3. Notify users who engaged with content
4. Review editorial process to prevent recurrence
5. Document in corrections log

**Retraction Notice Template**:
```
**Article Retracted**

This article has been retracted due to [specific reason]. 
We apologize for the error and are reviewing our editorial 
processes to prevent similar issues.

Original headline: [Title]
Published: [Date]
Retracted: [Date]
Reason: [Explanation]

[Contact information for questions]
```

---

## 10. Enforcement and Monitoring

### 10.1 Automated Monitoring

**AI Systems**:
- Scan all published content for attribution
- Flag missing or incomplete attribution
- Detect potential copyright issues (similarity matching)
- Monitor excerpt lengths
- Identify broken source links

**Alerts Triggered For**:
- Articles without attribution
- Excerpts exceeding 200 words
- Prohibited source usage
- Broken source links
- High similarity to source (potential copying)
- Missing "AI-generated" labels

### 10.2 Manual Audits

**Random Sampling**:
- 10% of daily articles audited by editors
- Focus on high-traffic content
- Review AI-generated analysis
- Check source credibility

**Targeted Reviews**:
- All articles from new sources
- Content on sensitive topics
- User-reported articles
- DMCA notice responses

### 10.3 Compliance Metrics

**Track**:
- Attribution accuracy rate (target: 100%)
- Average excerpt length (target: <200 words)
- Source link uptime (target: >98%)
- Correction rate (target: <2%)
- DMCA takedown requests (target: <10/year)
- User complaints (target: <5/month)

**Monthly Reports**:
- Compliance score by category
- Issues identified and resolved
- Source credibility updates
- Policy violation incidents

### 10.4 Consequences for Violations

**First Violation**:
- Article removed or corrected
- Warning issued to responsible agent/developer
- Incident documented

**Repeat Violations**:
- Suspension of agent or account
- Comprehensive review of processes
- Additional training required

**Severe Violations**:
- Immediate termination of access
- Legal review
- Report to authorities if applicable

---

## Appendix A: Quick Reference Checklist

### Before Publishing Any Content:

- [ ] **Source is approved** (Tier 1, 2, or 3)
- [ ] **Content acquired legally** (API, RSS, or licensed)
- [ ] **Attribution is complete**:
  - [ ] Source name
  - [ ] Article title
  - [ ] Author (if available)
  - [ ] Publication date
  - [ ] Direct link to original
- [ ] **Excerpt is within limits** (<200 words)
- [ ] **Content is transformative** (if AI-generated)
- [ ] **AI content is labeled** (if applicable)
- [ ] **Multiple sources cited** (for original analysis)
- [ ] **No prohibited practices** used
- [ ] **Quality checks passed**
- [ ] **Links are active**

---

## Appendix B: Attribution Code Templates

### HTML Template
```html
<article class="news-article" data-source-id="[SOURCE_ID]">
  <header>
    <h2 class="article-title">
      <a href="[ORIGINAL_URL]" target="_blank" rel="noopener">
        [Article Title]
      </a>
    </h2>
    <div class="article-meta">
      <span class="author">By [Author Name]</span>
      <span class="separator">|</span>
      <a href="[SOURCE_HOMEPAGE]" class="source-name">[Publication Name]</a>
      <span class="separator">|</span>
      <time datetime="[ISO_DATE]">[Formatted Date]</time>
    </div>
  </header>
  
  <div class="article-excerpt">
    <p>[Brief excerpt or summary]</p>
  </div>
  
  <footer>
    <a href="[ORIGINAL_URL]" class="read-more-link" target="_blank" rel="noopener">
      Read full article at [Publication Name] →
    </a>
  </footer>
</article>
```

### JSON Schema
```json
{
  "type": "aggregated_article",
  "source": {
    "id": "source_12345",
    "name": "The New York Times",
    "homepage": "https://nytimes.com",
    "credibility_rating": 5
  },
  "article": {
    "title": "Original Article Title",
    "url": "https://nytimes.com/2025/03/15/article",
    "author": "Jane Doe",
    "published_at": "2025-03-15T14:30:00Z",
    "excerpt": "Brief summary limited to 200 words...",
    "excerpt_length": 150
  },
  "metadata": {
    "aggregated_at": "2025-03-15T15:00:00Z",
    "attribution_complete": true,
    "fair_use_compliant": true
  }
}
```

---

## Appendix C: Contact Information

**Questions about these guidelines**:  
Email: editorial@digitaltide.com

**Report attribution issues**:  
Email: corrections@digitaltide.com

**DMCA notices**:  
Email: dmca@digitaltide.com

**Legal questions**:  
Email: legal@digitaltide.com

---

**Document Version**: 1.0  
**Last Updated**: October 26, 2025  
**Next Review**: January 26, 2026  
**Approved By**: [Legal & Editorial Teams]
