-- Add gif_url column to comments table
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS gif_url TEXT;

-- Optional: Add a check constraint to ensure comment has either text or GIF
-- (Uncomment if you want to enforce this rule)
-- ALTER TABLE comments
-- ADD CONSTRAINT comment_has_content
-- CHECK (
--   (comment_text IS NOT NULL AND comment_text != '')
--   OR
--   (gif_url IS NOT NULL AND gif_url != '')
-- );
