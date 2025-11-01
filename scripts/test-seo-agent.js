/**
 * Test script for SEO Agent (Phase 3.4)
 * Tests all 6 implemented tasks
 */

import SEOAgent from '../src/agents/specialized/SEOAgent.js';
import config from '../src/config/index.js';

// Test data
const testArticle = {
  id: 1,
  title: 'How Artificial Intelligence is Transforming Healthcare in 2025',
  content: `Artificial intelligence (AI) is revolutionizing healthcare delivery across the globe. 
  Machine learning algorithms are now capable of detecting diseases earlier than traditional methods. 
  AI-powered diagnostic tools can analyze medical images with remarkable accuracy, often surpassing human experts.
  
  Healthcare providers are implementing AI systems to improve patient outcomes and reduce costs. 
  Natural language processing helps doctors analyze patient records more efficiently. 
  Predictive analytics identify patients at risk of developing chronic conditions.
  
  The integration of AI in healthcare raises important ethical questions about data privacy and algorithm bias. 
  Medical professionals must balance technological innovation with patient care quality. 
  Future developments in AI healthcare will focus on personalized medicine and preventive care.
  
  Telemedicine platforms use AI to triage patients and recommend appropriate care pathways. 
  Drug discovery processes are accelerated through AI-driven molecular analysis. 
  Healthcare AI represents a paradigm shift in how medical services are delivered worldwide.`,
  excerpt:
    'Discover how artificial intelligence is transforming healthcare delivery, diagnosis, and patient care in 2025.',
  category: 'Technology',
  tags: ['AI', 'Healthcare', 'Machine Learning', 'Medical Technology', 'Innovation'],
  slug: 'ai-transforming-healthcare-2025',
  publishedAt: new Date('2025-10-28'),
  createdAt: new Date('2025-10-28'),
  updatedAt: new Date('2025-10-31'),
  featured: true,
  trending: true,
  views: 1500,
  comments: 25,
  images: [
    {
      url: 'https://digitaltide.com/images/ai-healthcare-hero.jpg',
      width: 1200,
      height: 630,
      title: 'AI in Healthcare',
      caption: 'Artificial intelligence transforming medical diagnosis',
    },
  ],
};

const testAuthor = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Smith',
  name: 'Jane Smith',
  email: 'jane.smith@digitaltide.com',
  bio: 'Technology journalist specializing in AI and healthcare innovation',
  jobTitle: 'Senior Technology Reporter',
  avatar: 'https://digitaltide.com/authors/jane-smith.jpg',
  url: 'https://digitaltide.com/authors/jane-smith',
  socialLinks: ['https://twitter.com/janesmith', 'https://linkedin.com/in/janesmith'],
};

const testOrganization = {
  name: 'DigitalTide',
  url: 'https://digitaltide.com',
  logo: 'https://digitaltide.com/logo.png',
  socialLinks: [
    'https://twitter.com/digitaltide',
    'https://facebook.com/digitaltide',
    'https://linkedin.com/company/digitaltide',
  ],
  contactPoint: {
    telephone: '+1-555-0123',
    email: 'contact@digitaltide.com',
  },
};

const relatedArticles = [
  {
    id: 2,
    title: 'Machine Learning Applications in Medical Diagnosis',
    content:
      'Machine learning transforms medical diagnosis through pattern recognition and predictive analytics. Healthcare AI systems analyze patient data to identify disease markers.',
    excerpt: 'Exploring machine learning applications in modern medical diagnosis',
    category: 'Technology',
    tags: ['Machine Learning', 'Medical Diagnosis', 'AI'],
    slug: 'machine-learning-medical-diagnosis',
    publishedAt: new Date('2025-10-25'),
    createdAt: new Date('2025-10-25'),
  },
  {
    id: 3,
    title: 'The Future of Telemedicine and Remote Healthcare',
    content:
      'Telemedicine enables remote patient care through digital platforms. Healthcare providers use video consultations and AI-powered triage systems.',
    excerpt: 'How telemedicine is reshaping healthcare delivery',
    category: 'Healthcare',
    tags: ['Telemedicine', 'Healthcare', 'Remote Care'],
    slug: 'future-telemedicine-remote-healthcare',
    publishedAt: new Date('2025-10-20'),
    createdAt: new Date('2025-10-20'),
  },
  {
    id: 4,
    title: 'Blockchain Technology in Financial Services',
    content:
      'Blockchain revolutionizes financial transactions through decentralized ledgers. Cryptocurrency adoption grows in mainstream finance.',
    excerpt: 'Understanding blockchain impact on finance',
    category: 'Finance',
    tags: ['Blockchain', 'Cryptocurrency', 'Finance'],
    slug: 'blockchain-financial-services',
    publishedAt: new Date('2025-09-15'),
    createdAt: new Date('2025-09-15'),
  },
];

// Color console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${'='.repeat(80)}`);
  log(title, 'bright');
  console.log(`${'='.repeat(80)}\n`);
}

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status} - ${testName}`, color);
  if (details) console.log(`   ${details}`);
}

async function runTests() {
  log('\n🧪 SEO Agent Test Suite (Phase 3.4)', 'cyan');
  log('Testing all 6 implemented tasks\n', 'cyan');

  const seoAgent = new SEOAgent('seo-agent-test', {
    maxKeywords: 10,
  });

  let totalTests = 0;
  let passedTests = 0;

  // ========================================================================
  // TASK #2: Meta Tag Optimization
  // ========================================================================
  logSection('TASK #2: Meta Tag Optimization (P1-CRITICAL)');

  try {
    totalTests++;
    const metaTags = await seoAgent.generateMetaTags({
      title: testArticle.title,
      content: testArticle.content,
      excerpt: testArticle.excerpt,
      url: `https://digitaltide.com/articles/${testArticle.slug}`,
      images: testArticle.images,
    });

    const hasTitle = metaTags.title && metaTags.title.length > 0;
    const hasDescription = metaTags.description && metaTags.description.length > 0;
    const hasKeywords = metaTags.keywords && metaTags.keywords.length > 0;
    const hasOpenGraph = metaTags.openGraph && metaTags.openGraph.title;
    const hasTwitter = metaTags.twitter && metaTags.twitter.card;
    const hasCanonical = metaTags.canonical;
    const hasQuality = typeof metaTags.quality === 'number';

    const allValid =
      hasTitle &&
      hasDescription &&
      hasKeywords &&
      hasOpenGraph &&
      hasTwitter &&
      hasCanonical &&
      hasQuality;

    logTest('Generate Meta Tags', allValid, `Quality Score: ${metaTags.quality}/100`);
    if (allValid) passedTests++;

    console.log('\nGenerated Meta Tags:');
    console.log(`  Title: "${metaTags.title}" (${metaTags.title.length} chars)`);
    console.log(`  Description: "${metaTags.description}" (${metaTags.description.length} chars)`);
    console.log(`  Keywords: ${metaTags.keywords.join(', ')}`);
    console.log(`  Canonical: ${metaTags.canonical}`);
    console.log(`  Quality Score: ${metaTags.quality}/100`);

    if (metaTags.validation && metaTags.validation.warnings.length > 0) {
      log('\n  ⚠️  Validation Warnings:', 'yellow');
      metaTags.validation.warnings.forEach(w => console.log(`    - ${w}`));
    }
  } catch (error) {
    logTest('Generate Meta Tags', false, error.message);
  }

  // ========================================================================
  // TASK #5: SEO Scoring and Suggestions
  // ========================================================================
  logSection('TASK #5: Comprehensive SEO Scoring (P2-HIGH)');

  try {
    totalTests++;
    const seoScore = await seoAgent.generateComprehensiveSEOScore({
      title: testArticle.title,
      content: testArticle.content,
      excerpt: testArticle.excerpt,
      keywords: testArticle.tags,
      url: `https://digitaltide.com/articles/${testArticle.slug}`,
      images: testArticle.images,
    });

    const hasOverallScore = typeof seoScore.overallScore === 'number';
    const hasComponentScores =
      seoScore.componentScores && Object.keys(seoScore.componentScores).length > 0;
    const hasSuggestions = seoScore.suggestions && seoScore.suggestions.length > 0;
    const hasStatus = seoScore.status;

    const allValid = hasOverallScore && hasComponentScores && hasSuggestions && hasStatus;

    logTest(
      'Generate SEO Score',
      allValid,
      `Overall Score: ${seoScore.overallScore}/100 (${seoScore.status})`
    );
    if (allValid) passedTests++;

    console.log('\nSEO Score Breakdown:');
    console.log(`  Overall Score: ${seoScore.overallScore}/100 ${seoScore.statusEmoji}`);
    console.log(`  Status: ${seoScore.status}`);
    console.log('\n  Component Scores:');
    Object.entries(seoScore.componentScores).forEach(([key, value]) => {
      console.log(`    ${key}: ${value}/100`);
    });

    console.log(`\n  Top 3 Suggestions (${seoScore.suggestions.length} total):`);
    seoScore.suggestions.slice(0, 3).forEach((s, i) => {
      console.log(`    ${i + 1}. [${s.priority.toUpperCase()}] ${s.suggestion}`);
      console.log(
        `       Impact: ${s.impact} | Effort: ${s.effort} | Gain: +${s.potentialGain} points`
      );
    });
  } catch (error) {
    logTest('Generate SEO Score', false, error.message);
  }

  // ========================================================================
  // TASK #1: Keyword Research Automation
  // ========================================================================
  logSection('TASK #1: Keyword Research Automation (P2-HIGH)');

  try {
    totalTests++;
    const keywordResearch = await seoAgent.researchKeywords({
      title: testArticle.title,
      content: testArticle.content,
      category: testArticle.category,
      targetAudience: 'Healthcare professionals and tech enthusiasts',
      competitors: ['AI healthcare solutions', 'medical technology innovation'],
    });

    const hasPrimary = keywordResearch.primary && keywordResearch.primary.length > 0;
    const hasSecondary = keywordResearch.secondary && keywordResearch.secondary.length > 0;
    const hasLongTail = keywordResearch.longTail && keywordResearch.longTail.length > 0;
    const hasMetrics = keywordResearch.metrics && keywordResearch.metrics.length > 0;
    const hasRecommendations =
      keywordResearch.recommendations && keywordResearch.recommendations.length > 0;

    const allValid = hasPrimary && hasSecondary && hasLongTail && hasMetrics && hasRecommendations;

    logTest(
      'Keyword Research',
      allValid,
      `Found ${keywordResearch.primary.length} primary keywords`
    );
    if (allValid) passedTests++;

    console.log('\nKeyword Research Results:');
    console.log(`  Primary Keywords (${keywordResearch.primary.length}):`);
    keywordResearch.primary.slice(0, 5).forEach((kw, i) => {
      const metric = keywordResearch.metrics.find(m => m.keyword === kw);
      if (metric) {
        console.log(
          `    ${i + 1}. "${kw}" - Opportunity: ${metric.opportunity}/100, Competition: ${metric.competition}/100`
        );
      }
    });

    console.log(`\n  Long-Tail Keywords (${keywordResearch.longTail.length}):`);
    keywordResearch.longTail.slice(0, 3).forEach((kw, i) => {
      console.log(`    ${i + 1}. "${kw}"`);
    });

    console.log(`\n  Top 3 Recommendations (${keywordResearch.recommendations.length} total):`);
    keywordResearch.recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`    ${i + 1}. [${rec.priority?.toUpperCase() || rec.type}] ${rec.action}`);
    });
  } catch (error) {
    logTest('Keyword Research', false, error.message);
  }

  // ========================================================================
  // TASK #3: Internal Linking Strategy
  // ========================================================================
  logSection('TASK #3: Internal Linking Strategy (P2-HIGH)');

  try {
    totalTests++;
    const linkingStrategy = await seoAgent.generateInternalLinkingStrategy({
      article: testArticle,
      allArticles: relatedArticles,
      maxLinks: 5,
      minRelevanceScore: 0.2,
    });

    const hasSuggestions = linkingStrategy.suggestions && linkingStrategy.suggestions.length > 0;
    const hasMetrics = linkingStrategy.metrics;
    const hasRecommendations =
      linkingStrategy.recommendations && linkingStrategy.recommendations.length > 0;

    const allValid = hasSuggestions && hasMetrics && hasRecommendations;

    logTest(
      'Internal Linking Strategy',
      allValid,
      `Found ${linkingStrategy.suggestions.length} link opportunities`
    );
    if (allValid) passedTests++;

    console.log('\nInternal Linking Results:');
    console.log(`  Link Suggestions: ${linkingStrategy.suggestions.length}`);
    console.log(
      `  Relevant Candidates: ${linkingStrategy.metrics.relevantCandidates}/${linkingStrategy.metrics.totalCandidates}`
    );

    console.log('\n  Top Link Suggestions:');
    linkingStrategy.suggestions.slice(0, 3).forEach((link, i) => {
      console.log(`    ${i + 1}. Link to: "${link.targetArticle.title}"`);
      console.log(`       Relevance: ${Math.round(link.relevanceScore * 100)}%`);
      console.log(`       Anchor Text: "${link.recommendedAnchorText.text}"`);
      console.log(`       Placement: ${link.placement.location} (${link.placement.rationale})`);
      console.log(`       Rationale: ${link.rationale}`);
    });

    console.log(`\n  Recommendations (${linkingStrategy.recommendations.length} total):`);
    linkingStrategy.recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`    ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
    });
  } catch (error) {
    logTest('Internal Linking Strategy', false, error.message);
  }

  // ========================================================================
  // TASK #4: Schema Markup Generation
  // ========================================================================
  logSection('TASK #4: Schema Markup Generation (P2-HIGH)');

  try {
    totalTests++;
    const schemaMarkup = seoAgent.generateSchemaMarkup({
      article: testArticle,
      author: testAuthor,
      organization: testOrganization,
      images: testArticle.images,
      breadcrumbs: [
        { name: 'Home', url: 'https://digitaltide.com' },
        { name: 'Technology', url: 'https://digitaltide.com/categories/technology' },
        { name: testArticle.title, url: `https://digitaltide.com/articles/${testArticle.slug}` },
      ],
      faqs: [
        {
          question: 'How is AI transforming healthcare?',
          answer:
            'AI is transforming healthcare through improved diagnostics, personalized treatment plans, and predictive analytics.',
        },
        {
          question: 'What are the benefits of AI in medical diagnosis?',
          answer:
            'AI in medical diagnosis provides faster, more accurate disease detection and reduces human error.',
        },
      ],
    });

    const hasSchemas = schemaMarkup.schemas && Object.keys(schemaMarkup.schemas).length > 0;
    const hasJsonLD = schemaMarkup.jsonLD && schemaMarkup.jsonLD.length > 0;
    const hasRecommendations =
      schemaMarkup.recommendations && schemaMarkup.recommendations.length > 0;

    const allValid = hasSchemas && hasJsonLD && hasRecommendations;

    logTest(
      'Schema Markup Generation',
      allValid,
      `Generated ${schemaMarkup.schemaCount} schema types`
    );
    if (allValid) passedTests++;

    console.log('\nSchema Markup Results:');
    console.log(`  Schema Types Generated: ${schemaMarkup.schemaCount}`);
    console.log(`  Schemas: ${Object.keys(schemaMarkup.schemas).join(', ')}`);
    console.log(`  JSON-LD Length: ${schemaMarkup.jsonLD.length} characters`);

    console.log('\n  JSON-LD Preview (first 500 chars):');
    console.log(`  ${schemaMarkup.jsonLD.substring(0, 500)}...`);

    if (schemaMarkup.recommendations.length > 0) {
      console.log(`\n  Recommendations (${schemaMarkup.recommendations.length} total):`);
      schemaMarkup.recommendations.slice(0, 3).forEach((rec, i) => {
        console.log(`    ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
        console.log(`       Benefit: ${rec.benefit}`);
      });
    }
  } catch (error) {
    logTest('Schema Markup Generation', false, error.message);
  }

  // ========================================================================
  // TASK #6: Sitemap Generation
  // ========================================================================
  logSection('TASK #6: Sitemap Generation (P2-HIGH)');

  try {
    totalTests++;
    const sitemap = await seoAgent.generateSitemap({
      articles: [testArticle, ...relatedArticles],
      categories: [
        { name: 'Technology', slug: 'technology' },
        { name: 'Healthcare', slug: 'healthcare' },
      ],
      pages: [
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
      ],
      baseUrl: 'https://digitaltide.com',
      options: {
        changefreq: 'daily',
        priority: 0.7,
        includeImages: true,
      },
    });

    const hasSitemaps = sitemap.sitemaps && sitemap.sitemaps.length > 0;
    const hasStatistics = sitemap.statistics;
    const totalUrls = sitemap.totalUrls > 0;

    const allValid = hasSitemaps && hasStatistics && totalUrls;

    logTest('Sitemap Generation', allValid, `Generated ${sitemap.totalUrls} URLs`);
    if (allValid) passedTests++;

    console.log('\nSitemap Results:');
    console.log(`  Total URLs: ${sitemap.totalUrls}`);
    console.log(`  Sitemaps Generated: ${sitemap.sitemaps.length}`);

    sitemap.sitemaps.forEach((sm, i) => {
      console.log(`    ${i + 1}. ${sm.filename} (${sm.urlCount} URLs, ${sm.xml.length} bytes)`);
    });

    console.log('\n  Statistics:');
    console.log(`    URLs with images: ${sitemap.statistics.withImages}`);
    console.log(`    URLs with news data: ${sitemap.statistics.withNews}`);
    console.log(
      '    By Change Frequency:',
      JSON.stringify(sitemap.statistics.byChangeFreq, null, 2)
    );

    console.log('\n  Sitemap XML Preview (first 800 chars):');
    console.log(`  ${sitemap.sitemaps[0].xml.substring(0, 800)}...`);

    // Test sitemap submission
    totalTests++;
    const submission = await seoAgent.submitSitemap({
      sitemapUrl: 'https://digitaltide.com/sitemap.xml',
      searchEngines: ['google', 'bing'],
    });

    const hasSubmissions = submission.submitted && submission.submitted.length > 0;
    logTest(
      'Sitemap Submission',
      hasSubmissions,
      `Prepared ${submission.submitted.length} submissions`
    );
    if (hasSubmissions) passedTests++;

    console.log('\n  Submission Results:');
    submission.submitted.forEach((sub, i) => {
      console.log(`    ${i + 1}. ${sub.engine.toUpperCase()}: ${sub.status}`);
      console.log(`       URL: ${sub.url}`);
    });
  } catch (error) {
    logTest('Sitemap Generation', false, error.message);
  }

  // ========================================================================
  // SUMMARY
  // ========================================================================
  logSection('TEST SUMMARY');

  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  const summaryColor =
    passedTests === totalTests ? 'green' : passedTests > totalTests / 2 ? 'yellow' : 'red';

  log(`Total Tests: ${totalTests}`, 'bright');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${totalTests - passedTests}`, 'red');
  log(`Success Rate: ${successRate}%`, summaryColor);

  if (passedTests === totalTests) {
    log('\n🎉 All tests passed! SEO Agent is fully operational.', 'green');
  } else if (passedTests > totalTests / 2) {
    log('\n⚠️  Most tests passed, but some issues detected.', 'yellow');
  } else {
    log('\n❌ Multiple test failures detected. Please review the errors above.', 'red');
  }

  console.log(`\n${'='.repeat(80)}\n`);

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Fatal error running tests:');
  console.error(error);
  process.exit(1);
});
