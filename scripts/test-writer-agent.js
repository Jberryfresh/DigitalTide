/**
 * Writer Agent Test Script - Phase 3.3
 * Comprehensive testing of all WriterAgent functionality
 *
 * Tests:
 * - P1 Task 1: Claude/GPT integration for article generation
 * - P1 Task 2: Content transformation and rewriting
 * - P1 Task 3: Headline generation and optimization
 * - P1 Task 4: Tone and style consistency checking
 * - P1 Task 5: Article structure templates
 * - P2 Task 6: Multimedia content suggestions
 * - P2 Task 7: Readability optimization
 * - P2 Task 8: Content length optimization
 * - P3 Task 9: Writing personality profiles
 */

import WriterAgent from '../src/agents/specialized/WriterAgent.js';
import 'dotenv/config';

// Test configuration
const config = {
  style: 'professional',
  length: 'medium',
  personality: 'balanced',
};

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(80)}`);
  console.log(`TEST: ${testName}`);
  console.log(`${'='.repeat(80)}${colors.reset}\n`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Test data
const testArticle = {
  topic: 'Artificial Intelligence Revolution in Healthcare',
  content: `Artificial intelligence is transforming the healthcare industry in unprecedented ways. Machine learning algorithms are now being used to diagnose diseases with remarkable accuracy, sometimes even surpassing human doctors. These systems analyze vast amounts of medical data, identifying patterns that would be impossible for humans to detect.

Recent studies have shown that AI-powered diagnostic tools can detect certain cancers at earlier stages than traditional methods. This early detection is crucial, as it significantly improves patient outcomes and survival rates. Hospitals around the world are beginning to adopt these technologies, integrating them into their standard diagnostic procedures.

However, the adoption of AI in healthcare is not without challenges. Privacy concerns regarding patient data, the need for regulatory approval, and the high cost of implementing these systems are all barriers that must be overcome. Despite these challenges, experts predict that AI will become an integral part of healthcare within the next decade.`,
  title: 'AI Transforms Healthcare: Early Disease Detection Saves Lives',
};

async function runTests() {
  const stats = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  log(
    '\n╔═══════════════════════════════════════════════════════════════════════════════╗',
    colors.bright + colors.cyan
  );
  log(
    '║                    WRITER AGENT - PHASE 3.3 TEST SUITE                      ║',
    colors.bright + colors.cyan
  );
  log(
    '╚═══════════════════════════════════════════════════════════════════════════════╝',
    colors.bright + colors.cyan
  );

  const agent = new WriterAgent(config);

  try {
    // Initialize agent
    logTest('Agent Initialization');
    stats.total++;
    await agent.start();
    logSuccess('Agent initialized successfully');
    stats.passed++;

    // Test 1: Article Generation (P1 Task 1)
    logTest('P1 Task 1: Claude/GPT Integration - Article Generation');
    stats.total++;
    try {
      const articleParams = {
        topic: 'The Future of Quantum Computing',
        style: 'professional',
        length: 'medium',
        keywords: ['quantum', 'computing', 'technology', 'breakthrough'],
        targetAudience: 'tech-savvy general public',
      };

      logInfo(`Generating article: "${articleParams.topic}"`);
      const article = await agent.writeArticle(articleParams);

      if (article.headline && article.content && article.excerpt) {
        logSuccess('Article generated successfully');
        logInfo(`Headline: ${article.headline}`);
        logInfo(`Word count: ${article.metadata.wordCount}`);
        logInfo(`Estimated read time: ${article.estimatedReadTime} minutes`);
        logInfo(`Tokens used: ${article.metadata.tokensUsed}`);
        stats.passed++;
      } else {
        throw new Error('Article missing required fields');
      }
    } catch (error) {
      logError(`Article generation failed: ${error.message}`);
      stats.failed++;
    }

    // Test 2: Content Rewriting (P1 Task 2)
    logTest('P1 Task 2: Content Transformation - Rewriting');
    stats.total++;
    try {
      const rewriteParams = {
        originalContent: testArticle.content,
        originalTitle: testArticle.title,
        newStyle: 'casual',
        preserveFacts: true,
      };

      logInfo('Rewriting article in casual style...');
      const rewritten = await agent.rewriteArticle(rewriteParams);

      if (rewritten.content && rewritten.headline) {
        logSuccess('Article rewritten successfully');
        logInfo(`New headline: ${rewritten.headline}`);
        logInfo(`Changes made: ${rewritten.changes}`);
        stats.passed++;
      } else {
        throw new Error('Rewritten article missing required fields');
      }
    } catch (error) {
      logError(`Content rewriting failed: ${error.message}`);
      stats.failed++;
    }

    // Test 3: Headline Generation and Optimization (P1 Task 3)
    logTest('P1 Task 3: Headline Generation and Optimization');
    stats.total++;
    try {
      const headlineParams = {
        topic: testArticle.topic,
        content: testArticle.content,
        count: 5,
        style: 'professional',
      };

      logInfo(`Generating ${headlineParams.count} headline options...`);
      const headlines = await agent.generateHeadlines(headlineParams);

      if (headlines.headlines && headlines.headlines.length > 0) {
        logSuccess(`Generated ${headlines.headlines.length} headlines`);
        logInfo(`Best headline (score: ${headlines.recommended.score}/100):`);
        logInfo(`  "${headlines.recommended.text}"`);

        log('\nAll Headlines:', colors.cyan);
        headlines.headlines.forEach((h, i) => {
          log(`  ${i + 1}. [${h.score}/100] ${h.text}`, colors.cyan);
          log(`     Approach: ${h.approach}`, colors.cyan);
        });

        stats.passed++;
      } else {
        throw new Error('No headlines generated');
      }
    } catch (error) {
      logError(`Headline generation failed: ${error.message}`);
      stats.failed++;
    }

    // Test 4: Tone and Style Consistency Checking (P1 Task 4)
    logTest('P1 Task 4: Tone and Style Consistency Checking');
    stats.total++;
    try {
      const consistencyParams = {
        content: testArticle.content,
        targetStyle: 'professional',
        targetPersonality: 'authoritative',
      };

      logInfo('Analyzing content consistency...');
      const consistency = await agent.checkConsistency(consistencyParams);

      if (consistency.consistencyScore !== undefined) {
        logSuccess('Consistency analysis completed');
        logInfo(`Overall consistency score: ${consistency.consistencyScore}/100`);
        logInfo(`Tone consistency: ${consistency.toneConsistency.score}/100`);
        logInfo(`Voice consistency: ${consistency.voiceConsistency.score}/100`);

        if (consistency.styleIssues && consistency.styleIssues.length > 0) {
          logInfo(`Style issues found: ${consistency.styleIssues.length}`);
          consistency.styleIssues.slice(0, 3).forEach((issue, i) => {
            log(`  ${i + 1}. ${issue.issue}`, colors.yellow);
          });
        }

        stats.passed++;
      } else {
        throw new Error('Consistency check returned invalid results');
      }
    } catch (error) {
      logError(`Consistency checking failed: ${error.message}`);
      stats.failed++;
    }

    // Test 5: Article Structure Templates (P1 Task 5)
    logTest('P1 Task 5: Article Structure Templates');
    stats.total++;
    try {
      const templateParams = {
        templateType: 'breakingNews',
        topic: 'Major Breakthrough in Fusion Energy Research',
        data: {
          keyPoints: [
            'Scientists achieve net energy gain',
            'Historic milestone for clean energy',
            'Could revolutionize power generation',
          ],
        },
        style: 'professional',
      };

      logInfo(`Generating article using "${templateParams.templateType}" template...`);
      const article = await agent.generateFromTemplate(templateParams);

      if (article.headline && article.sections && article.fullContent) {
        logSuccess('Template-based article generated');
        logInfo(`Template: ${article.templateName}`);
        logInfo(`Headline: ${article.headline}`);
        logInfo(`Sections: ${article.sections.length}`);
        logInfo(`Word count: ${article.metadata.wordCount}`);

        log('\nArticle Structure:', colors.cyan);
        article.sections.forEach((section, i) => {
          log(`  ${i + 1}. ${section.heading}`, colors.cyan);
        });

        stats.passed++;
      } else {
        throw new Error('Template-generated article missing required fields');
      }
    } catch (error) {
      logError(`Template generation failed: ${error.message}`);
      stats.failed++;
    }

    // Test 6: Multimedia Content Suggestions (P2 Task 6)
    logTest('P2 Task 6: Multimedia Content Suggestions');
    stats.total++;
    try {
      const multimediaParams = {
        title: testArticle.title,
        content: testArticle.content,
        topic: 'Healthcare Technology',
      };

      logInfo('Generating multimedia suggestions...');
      const suggestions = await agent.suggestMultimedia(multimediaParams);

      if (suggestions.featuredImage) {
        logSuccess('Multimedia suggestions generated');
        logInfo('Featured Image:');
        logInfo(`  Description: ${suggestions.featuredImage.description}`);
        logInfo(`  Style: ${suggestions.featuredImage.style}`);

        if (suggestions.additionalImages && suggestions.additionalImages.length > 0) {
          logInfo(`Additional images: ${suggestions.additionalImages.length}`);
        }

        if (suggestions.videoSuggestions && suggestions.videoSuggestions.length > 0) {
          logInfo(`Video suggestions: ${suggestions.videoSuggestions.length}`);
        }

        if (suggestions.infographicIdeas && suggestions.infographicIdeas.length > 0) {
          logInfo(`Infographic ideas: ${suggestions.infographicIdeas.length}`);
        }

        stats.passed++;
      } else {
        throw new Error('Multimedia suggestions incomplete');
      }
    } catch (error) {
      logError(`Multimedia suggestions failed: ${error.message}`);
      stats.failed++;
    }

    // Test 7: Readability Optimization (P2 Task 7)
    logTest('P2 Task 7: Readability Optimization');
    stats.total++;
    try {
      const readabilityParams = {
        content: testArticle.content,
        targetAudience: 'general',
      };

      logInfo('Optimizing content for readability...');
      const optimized = await agent.optimizeReadability(readabilityParams);

      if (optimized.optimizedContent && optimized.metrics) {
        logSuccess('Readability optimization completed');
        logInfo('Before:');
        logInfo(`  Avg sentence length: ${optimized.metrics.before.avgSentenceLength} words`);
        logInfo(`  Passive voice: ${optimized.metrics.before.passiveVoicePercent}%`);
        logInfo(`  Flesch Reading Ease: ${optimized.metrics.before.fleschReadingEase}`);

        logInfo('After:');
        logInfo(`  Avg sentence length: ${optimized.metrics.after.avgSentenceLength} words`);
        logInfo(`  Passive voice: ${optimized.metrics.after.passiveVoicePercent}%`);
        logInfo(`  Flesch Reading Ease: ${optimized.metrics.after.fleschReadingEase}`);

        logInfo('Improvement:');
        logInfo(
          `  Sentence length: ${optimized.metrics.improvement.sentenceLength.toFixed(1)} words shorter`
        );
        logInfo(`  Passive voice: ${optimized.metrics.improvement.passiveVoice.toFixed(1)}% less`);

        if (optimized.changes && optimized.changes.length > 0) {
          logInfo(`Changes made: ${optimized.changes.length}`);
        }

        stats.passed++;
      } else {
        throw new Error('Readability optimization incomplete');
      }
    } catch (error) {
      logError(`Readability optimization failed: ${error.message}`);
      stats.failed++;
    }

    // Test 8: Content Length Optimization (P2 Task 8)
    logTest('P2 Task 8: Content Length Optimization');
    stats.total++;
    try {
      const lengthParams = {
        topic: testArticle.topic,
        category: 'Technology',
        content: testArticle.content,
        contentType: 'analysis',
      };

      logInfo('Analyzing content length...');
      const lengthAnalysis = await agent.optimizeLength(lengthParams);

      if (lengthAnalysis.assessment) {
        logSuccess('Length analysis completed');
        logInfo(`Current length: ${lengthAnalysis.currentLength} words`);
        logInfo(
          `Optimal range: ${lengthAnalysis.optimalRange.min}-${lengthAnalysis.optimalRange.max} words`
        );
        logInfo(`Assessment: ${lengthAnalysis.assessment}`);
        logInfo(`Action: ${lengthAnalysis.action}`);
        logInfo(`Reasoning: ${lengthAnalysis.reasoning}`);

        if (lengthAnalysis.suggestions && lengthAnalysis.suggestions.length > 0) {
          logInfo(`Suggestions provided: ${lengthAnalysis.suggestions.length}`);
        }

        stats.passed++;
      } else {
        throw new Error('Length optimization incomplete');
      }
    } catch (error) {
      logError(`Length optimization failed: ${error.message}`);
      stats.failed++;
    }

    // Test 9: Writing Personality Profiles (P3 Task 9)
    logTest('P3 Task 9: Writing Personality Profiles');
    stats.total++;
    try {
      logInfo('Testing personality profiles...');
      const personalities = agent.getAvailablePersonalities();

      if (personalities && personalities.length > 0) {
        logSuccess(`Found ${personalities.length} personality profiles`);

        personalities.forEach(p => {
          log(`\n  ${p.name}:`, colors.cyan);
          log(`    Description: ${p.description}`, colors.cyan);
          log(`    Traits: ${p.traits.join(', ')}`, colors.cyan);
        });

        stats.passed++;
      } else {
        throw new Error('No personality profiles found');
      }
    } catch (error) {
      logError(`Personality profiles test failed: ${error.message}`);
      stats.failed++;
    }

    // Test 10: Additional Features
    logTest('Additional Features: Templates, Styles, Statistics');
    stats.total++;
    try {
      const templates = agent.getAvailableTemplates();
      const styles = agent.getAvailableStyles();
      const agentStats = agent.getWritingStats();

      logSuccess('Successfully retrieved agent metadata');
      logInfo(`Available templates: ${templates.length}`);
      templates.forEach(t => {
        log(`  - ${t.name} (${t.type})`, colors.cyan);
      });

      logInfo(`Available styles: ${styles.length}`);
      styles.forEach(s => {
        log(`  - ${s.name}`, colors.cyan);
      });

      logInfo('Agent Statistics:');
      logInfo(`  Articles generated: ${agentStats.writing.articlesGenerated}`);
      logInfo(`  Headlines optimized: ${agentStats.writing.headlinesOptimized}`);
      logInfo(`  Tasks executed: ${agentStats.stats.tasksExecuted}`);
      logInfo(`  Success rate: ${agentStats.stats.successRate.toFixed(1)}%`);

      stats.passed++;
    } catch (error) {
      logError(`Additional features test failed: ${error.message}`);
      stats.failed++;
    }

    // Stop agent
    await agent.stop();
  } catch (error) {
    logError(`Test suite error: ${error.message}`);
    console.error(error.stack);
  }

  // Print summary
  log(
    '\n╔═══════════════════════════════════════════════════════════════════════════════╗',
    colors.bright + colors.cyan
  );
  log(
    '║                              TEST SUMMARY                                    ║',
    colors.bright + colors.cyan
  );
  log(
    '╚═══════════════════════════════════════════════════════════════════════════════╝',
    colors.bright + colors.cyan
  );
  log(`\nTotal Tests: ${stats.total}`, colors.bright);
  logSuccess(`Passed: ${stats.passed}`);
  if (stats.failed > 0) {
    logError(`Failed: ${stats.failed}`);
  }
  if (stats.warnings > 0) {
    logWarning(`Warnings: ${stats.warnings}`);
  }

  const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
  if (passRate === '100.0') {
    log(`\n✨ Pass Rate: ${passRate}% - ALL TESTS PASSED! ✨`, colors.green + colors.bright);
  } else if (passRate >= 80) {
    log(`\nPass Rate: ${passRate}% - Good!`, colors.green);
  } else if (passRate >= 60) {
    log(`\nPass Rate: ${passRate}% - Needs improvement`, colors.yellow);
  } else {
    log(`\nPass Rate: ${passRate}% - Requires attention`, colors.red);
  }

  console.log();
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
