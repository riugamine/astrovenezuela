-- Enable the unaccent extension for accent-insensitive search
-- This extension removes accents from text, allowing for better search functionality
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create a helper function to normalize text (lowercase + remove accents)
-- This function can be used in search queries to match text regardless of case or accents
CREATE OR REPLACE FUNCTION normalize_for_search(text)
RETURNS text AS $$
  SELECT lower(unaccent($1))
$$ LANGUAGE SQL IMMUTABLE;

-- Optional: Create an index on the normalized product names for better performance
-- This will speed up searches significantly
CREATE INDEX IF NOT EXISTS idx_products_name_normalized 
ON products (normalize_for_search(name));

-- Add a comment to document the function
COMMENT ON FUNCTION normalize_for_search(text) IS 
'Normalizes text for search by converting to lowercase and removing accents. Used for accent-insensitive and case-insensitive searches.';

