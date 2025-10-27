-- Seed Data: Categories
-- Pre-populate standard news categories

INSERT INTO categories (name, slug, description, icon, color, sort_order, is_active) VALUES
('World', 'world', 'International news and global affairs', '🌍', '#3B82F6', 1, true),
('Politics', 'politics', 'Political news and government updates', '🏛️', '#8B5CF6', 2, true),
('Business', 'business', 'Business, markets, and economy', '💼', '#10B981', 3, true),
('Technology', 'technology', 'Tech innovations and digital trends', '💻', '#06B6D4', 4, true),
('Science', 'science', 'Scientific discoveries and research', '🔬', '#6366F1', 5, true),
('Health', 'health', 'Health, wellness, and medical news', '🏥', '#EF4444', 6, true),
('Sports', 'sports', 'Sports news and updates', '⚽', '#F59E0B', 7, true),
('Entertainment', 'entertainment', 'Entertainment and celebrity news', '🎬', '#EC4899', 8, true),
('Climate', 'climate', 'Climate change and environmental news', '🌱', '#22C55E', 9, true),
('Culture', 'culture', 'Arts, culture, and lifestyle', '🎨', '#A855F7', 10, true),
('Education', 'education', 'Education and learning', '📚', '#F97316', 11, true),
('Travel', 'travel', 'Travel destinations and tips', '✈️', '#0EA5E9', 12, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert default admin user (password: Admin123!)
-- Password hash generated with bcrypt, rounds=10
INSERT INTO users (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  role, 
  email_verified,
  is_active
) VALUES (
  'admin@digitaltide.com',
  '$2b$10$YOURBCRYPTHASHHERExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  'Admin',
  'User',
  'super_admin',
  true,
  true
) ON CONFLICT (email) DO NOTHING;

-- Note: The password hash above is a placeholder. 
-- You should generate a proper hash using bcrypt with your chosen password.
-- Example using Node.js:
--   const bcrypt = require('bcrypt');
--   const hash = await bcrypt.hash('Admin123!', 10);
