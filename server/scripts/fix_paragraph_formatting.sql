-- SQL script to fix paragraph formatting in existing articles
-- This script performs basic normalization of paragraph formatting
-- Note: For more comprehensive fixes, use the TypeScript normalization function

-- Update blog_posts table
-- Fix 1: Replace patterns like "sentence.\nNext sentence" with "sentence.\n\nNext sentence"
UPDATE blog_posts 
SET content = REPLACE(content, '.' || CHAR(10), '.' || CHAR(10) || CHAR(10))
WHERE content LIKE '%.' || CHAR(10) || '%';

-- Fix 2: Replace patterns like "sentence!\nNext sentence" with "sentence!\n\nNext sentence"
UPDATE blog_posts 
SET content = REPLACE(content, '!' || CHAR(10), '!' || CHAR(10) || CHAR(10))
WHERE content LIKE '%!' || CHAR(10) || '%';

-- Fix 3: Replace patterns like "sentence?\nNext sentence" with "sentence?\n\nNext sentence"
UPDATE blog_posts 
SET content = REPLACE(content, '?' || CHAR(10), '?' || CHAR(10) || CHAR(10))
WHERE content LIKE '%?' || CHAR(10) || '%';

-- Fix 4: Replace Windows line endings with Unix line endings
UPDATE blog_posts 
SET content = REPLACE(content, CHAR(13) || CHAR(10), CHAR(10))
WHERE content LIKE '%' || CHAR(13) || CHAR(10) || '%';

-- Fix 5: Replace HTML line breaks with paragraph breaks
UPDATE blog_posts 
SET content = REPLACE(content, '<br>', CHAR(10) || CHAR(10))
WHERE content LIKE '%<br>%';

UPDATE blog_posts 
SET content = REPLACE(content, '<br/>', CHAR(10) || CHAR(10))
WHERE content LIKE '%<br/>%';

UPDATE blog_posts 
SET content = REPLACE(content, '<br />', CHAR(10) || CHAR(10))
WHERE content LIKE '%<br />%';

-- Fix 6: Ensure at least two newlines between paragraphs (simplified)
-- This is a simplified version - for complex cases, use the TypeScript function
UPDATE blog_posts 
SET content = REPLACE(content, CHAR(10) || CHAR(10) || CHAR(10), CHAR(10) || CHAR(10))
WHERE content LIKE '%' || CHAR(10) || CHAR(10) || CHAR(10) || '%';

-- Update recipes table (if it exists)
-- Recipes store paragraphs as JSON array, so we need a different approach
-- This would require more complex JSON processing which SQLite doesn't handle well
-- For recipes, it's better to use the TypeScript migration script

-- Print summary
SELECT 'Updated ' || changes() || ' rows in blog_posts table' AS result;

-- Show sample of fixed content
SELECT key, SUBSTR(content, 1, 200) || '...' AS preview
FROM blog_posts
WHERE (
    content LIKE '%.' || CHAR(10) || '%' OR
    content LIKE '%!' || CHAR(10) || '%' OR
    content LIKE '%?' || CHAR(10) || '%' OR
    content LIKE '%' || CHAR(13) || CHAR(10) || '%' OR
    content LIKE '%<br>%' OR
    content LIKE '%<br/>%' OR
    content LIKE '%<br />%'
)
LIMIT 5;
