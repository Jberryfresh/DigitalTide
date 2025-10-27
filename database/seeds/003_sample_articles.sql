-- Sample Articles for Development
-- Create demo content for testing

INSERT INTO articles (
  title,
  slug,
  content,
  summary,
  featured_image_url,
  status,
  category_id,
  quality_score,
  fact_check_score,
  seo_score,
  readability_score,
  reading_time,
  word_count,
  published_at,
  agent_created
) VALUES
(
  'Breaking: Major Breakthrough in AI Research',
  'breaking-major-breakthrough-in-ai-research',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  'Researchers announce a significant advancement in artificial intelligence that could transform multiple industries.',
  'https://via.placeholder.com/1200x630/3B82F6/FFFFFF?text=AI+Breakthrough',
  'published',
  (SELECT id FROM categories WHERE slug = 'technology'),
  0.92,
  0.88,
  0.95,
  0.85,
  5,
  500,
  NOW() - INTERVAL '2 hours',
  'Writer Agent'
),
(
  'Global Climate Summit Reaches Historic Agreement',
  'global-climate-summit-reaches-historic-agreement',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.\n\nNemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
  'World leaders commit to ambitious new climate targets at international summit.',
  'https://via.placeholder.com/1200x630/22C55E/FFFFFF?text=Climate+Summit',
  'published',
  (SELECT id FROM categories WHERE slug = 'climate'),
  0.95,
  0.93,
  0.90,
  0.88,
  7,
  700,
  NOW() - INTERVAL '5 hours',
  'Writer Agent'
),
(
  'Tech Giants Face New Regulatory Challenges',
  'tech-giants-face-new-regulatory-challenges',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'New legislation targets major technology companies with stricter data privacy requirements.',
  'https://via.placeholder.com/1200x630/8B5CF6/FFFFFF?text=Tech+Regulation',
  'published',
  (SELECT id FROM categories WHERE slug = 'business'),
  0.88,
  0.90,
  0.87,
  0.82,
  4,
  400,
  NOW() - INTERVAL '12 hours',
  'Writer Agent'
),
(
  'Scientists Discover Potential Cure for Rare Disease',
  'scientists-discover-potential-cure-for-rare-disease',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  'Medical researchers announce breakthrough treatment that shows promise in clinical trials.',
  'https://via.placeholder.com/1200x630/EF4444/FFFFFF?text=Medical+Breakthrough',
  'published',
  (SELECT id FROM categories WHERE slug = 'health'),
  0.93,
  0.95,
  0.88,
  0.86,
  6,
  600,
  NOW() - INTERVAL '1 day',
  'Writer Agent'
),
(
  'International Sports Competition Draws Record Viewership',
  'international-sports-competition-draws-record-viewership',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Historic sporting event breaks all-time viewership records across multiple platforms.',
  'https://via.placeholder.com/1200x630/F59E0B/FFFFFF?text=Sports+Event',
  'draft',
  (SELECT id FROM categories WHERE slug = 'sports'),
  0.80,
  0.85,
  0.82,
  0.88,
  3,
  300,
  NULL,
  'Writer Agent'
);

-- Insert sample tags
INSERT INTO tags (name, slug, usage_count) VALUES
('artificial-intelligence', 'artificial-intelligence', 1),
('machine-learning', 'machine-learning', 1),
('climate-change', 'climate-change', 1),
('renewable-energy', 'renewable-energy', 1),
('regulation', 'regulation', 1),
('data-privacy', 'data-privacy', 1),
('medical-research', 'medical-research', 1),
('clinical-trials', 'clinical-trials', 1),
('sports', 'sports', 1),
('breaking-news', 'breaking-news', 4)
ON CONFLICT (slug) DO NOTHING;

-- Link articles to tags
INSERT INTO article_tags (article_id, tag_id) VALUES
((SELECT id FROM articles WHERE slug = 'breaking-major-breakthrough-in-ai-research'), (SELECT id FROM tags WHERE slug = 'artificial-intelligence')),
((SELECT id FROM articles WHERE slug = 'breaking-major-breakthrough-in-ai-research'), (SELECT id FROM tags WHERE slug = 'machine-learning')),
((SELECT id FROM articles WHERE slug = 'breaking-major-breakthrough-in-ai-research'), (SELECT id FROM tags WHERE slug = 'breaking-news')),
((SELECT id FROM articles WHERE slug = 'global-climate-summit-reaches-historic-agreement'), (SELECT id FROM tags WHERE slug = 'climate-change')),
((SELECT id FROM articles WHERE slug = 'global-climate-summit-reaches-historic-agreement'), (SELECT id FROM tags WHERE slug = 'renewable-energy')),
((SELECT id FROM articles WHERE slug = 'global-climate-summit-reaches-historic-agreement'), (SELECT id FROM tags WHERE slug = 'breaking-news')),
((SELECT id FROM articles WHERE slug = 'tech-giants-face-new-regulatory-challenges'), (SELECT id FROM tags WHERE slug = 'regulation')),
((SELECT id FROM articles WHERE slug = 'tech-giants-face-new-regulatory-challenges'), (SELECT id FROM tags WHERE slug = 'data-privacy')),
((SELECT id FROM articles WHERE slug = 'tech-giants-face-new-regulatory-challenges'), (SELECT id FROM tags WHERE slug = 'breaking-news')),
((SELECT id FROM articles WHERE slug = 'scientists-discover-potential-cure-for-rare-disease'), (SELECT id FROM tags WHERE slug = 'medical-research')),
((SELECT id FROM articles WHERE slug = 'scientists-discover-potential-cure-for-rare-disease'), (SELECT id FROM tags WHERE slug = 'clinical-trials')),
((SELECT id FROM articles WHERE slug = 'scientists-discover-potential-cure-for-rare-disease'), (SELECT id FROM tags WHERE slug = 'breaking-news')),
((SELECT id FROM articles WHERE slug = 'international-sports-competition-draws-record-viewership'), (SELECT id FROM tags WHERE slug = 'sports'))
ON CONFLICT DO NOTHING;

-- Link articles to sources
INSERT INTO article_sources (article_id, source_id, source_url, relevance_score) VALUES
((SELECT id FROM articles WHERE slug = 'breaking-major-breakthrough-in-ai-research'), (SELECT id FROM sources WHERE domain = 'techcrunch.com'), 'https://techcrunch.com/sample-article', 0.92),
((SELECT id FROM articles WHERE slug = 'global-climate-summit-reaches-historic-agreement'), (SELECT id FROM sources WHERE domain = 'reuters.com'), 'https://reuters.com/sample-article', 0.95),
((SELECT id FROM articles WHERE slug = 'tech-giants-face-new-regulatory-challenges'), (SELECT id FROM sources WHERE domain = 'bloomberg.com'), 'https://bloomberg.com/sample-article', 0.88),
((SELECT id FROM articles WHERE slug = 'scientists-discover-potential-cure-for-rare-disease'), (SELECT id FROM sources WHERE domain = 'nature.com'), 'https://nature.com/sample-article', 0.96)
ON CONFLICT DO NOTHING;
