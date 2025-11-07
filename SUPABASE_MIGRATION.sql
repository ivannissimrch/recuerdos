-- =====================================================
-- RECUERDOS APP - DATABASE MIGRATION
-- Add reaction_type column to support multiple pet reactions
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Add reaction_type column (allows NULL temporarily)
ALTER TABLE reactions
ADD COLUMN IF NOT EXISTS reaction_type VARCHAR(20);

-- Step 2: Set default value for existing rows (they were all "heart")
UPDATE reactions
SET reaction_type = 'heart'
WHERE reaction_type IS NULL;

-- Step 3: Make it NOT NULL now that all rows have a value
ALTER TABLE reactions
ALTER COLUMN reaction_type SET NOT NULL;

-- Step 4: Drop old unique constraint if it exists
ALTER TABLE reactions
DROP CONSTRAINT IF EXISTS reactions_memory_id_author_name_key;

-- Step 5: Add new unique constraint
-- Now same person can use multiple reaction types on same memory
-- But can't use the SAME reaction type twice
ALTER TABLE reactions
ADD CONSTRAINT reactions_memory_author_type_unique
UNIQUE (memory_id, author_name, reaction_type);

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- Now your reactions support:
-- ✅ 'rucho' - Chihuahua reaction
-- ✅ 'leo' - Poodle reaction
-- ✅ 'simba' - Cat reaction (when you add it!)
-- ✅ Same person can react with multiple pets
-- ✅ Same person cannot react with same pet twice
-- =====================================================
