-- Create a function to search products with normalized text (accent-insensitive)
-- This function searches in both product name and category name
CREATE OR REPLACE FUNCTION search_products_normalized(
  search_query TEXT,
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 12
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  price DECIMAL,
  main_image_url TEXT,
  category_id UUID,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total_count BIGINT
) AS $$
DECLARE
  offset_value INTEGER;
BEGIN
  -- Calculate offset for pagination
  offset_value := (page_number - 1) * page_size;
  
  -- Return products that match the normalized search query
  RETURN QUERY
  WITH search_results AS (
    SELECT 
      p.*,
      COUNT(*) OVER() as total_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 
      p.is_active = true
      AND (
        normalize_for_search(p.name) LIKE '%' || normalize_for_search(search_query) || '%'
        OR normalize_for_search(c.name) LIKE '%' || normalize_for_search(search_query) || '%'
      )
    ORDER BY p.created_at DESC
    LIMIT page_size
    OFFSET offset_value
  )
  SELECT 
    sr.id,
    sr.name,
    sr.slug,
    sr.description,
    sr.price,
    sr.main_image_url,
    sr.category_id,
    sr.is_active,
    sr.created_at,
    sr.updated_at,
    sr.total_count
  FROM search_results sr;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment to document the function
COMMENT ON FUNCTION search_products_normalized(TEXT, INTEGER, INTEGER) IS 
'Searches products by name or category name with accent-insensitive matching. Returns paginated results with total count.';

