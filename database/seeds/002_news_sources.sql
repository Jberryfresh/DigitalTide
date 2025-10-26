-- Seed Data: News Sources
-- Pre-populate trusted news sources for crawling

INSERT INTO sources (name, url, domain, source_type, credibility_score, is_active, crawl_frequency) VALUES
('BBC News', 'https://www.bbc.com/news', 'bbc.com', 'rss_feed', 0.95, true, 1800),
('Reuters', 'https://www.reuters.com', 'reuters.com', 'rss_feed', 0.95, true, 1800),
('Associated Press', 'https://apnews.com', 'apnews.com', 'rss_feed', 0.93, true, 1800),
('The Guardian', 'https://www.theguardian.com', 'theguardian.com', 'rss_feed', 0.90, true, 3600),
('CNN', 'https://www.cnn.com', 'cnn.com', 'rss_feed', 0.85, true, 3600),
('The New York Times', 'https://www.nytimes.com', 'nytimes.com', 'rss_feed', 0.92, true, 3600),
('The Washington Post', 'https://www.washingtonpost.com', 'washingtonpost.com', 'rss_feed', 0.90, true, 3600),
('Al Jazeera', 'https://www.aljazeera.com', 'aljazeera.com', 'rss_feed', 0.88, true, 3600),
('NPR', 'https://www.npr.org', 'npr.org', 'rss_feed', 0.91, true, 3600),
('Bloomberg', 'https://www.bloomberg.com', 'bloomberg.com', 'rss_feed', 0.90, true, 3600),
('TechCrunch', 'https://techcrunch.com', 'techcrunch.com', 'rss_feed', 0.85, true, 7200),
('Ars Technica', 'https://arstechnica.com', 'arstechnica.com', 'rss_feed', 0.88, true, 7200),
('Scientific American', 'https://www.scientificamerican.com', 'scientificamerican.com', 'rss_feed', 0.92, true, 7200),
('Nature', 'https://www.nature.com', 'nature.com', 'rss_feed', 0.95, true, 14400),
('The Verge', 'https://www.theverge.com', 'theverge.com', 'rss_feed', 0.82, true, 7200)
ON CONFLICT DO NOTHING;

-- Sample API configuration for sources (JSON format)
-- Note: Actual API keys should be stored in environment variables

UPDATE sources SET api_config = jsonb_build_object(
  'api_name', 'NewsAPI',
  'rate_limit', 100,
  'rate_limit_window', 'day'
) WHERE source_type = 'api';

UPDATE sources SET crawl_config = jsonb_build_object(
  'user_agent', 'DigitalTide-Bot/1.0',
  'max_depth', 2,
  'respect_robots_txt', true,
  'delay_ms', 1000
) WHERE source_type = 'rss_feed';
