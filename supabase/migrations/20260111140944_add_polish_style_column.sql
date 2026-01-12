/*
  # Add polish style tracking

  1. Changes
    - Add `polish_style` column to `wins` table to track which style (resume, review, or linkedin) was used for polishing
  
  2. Notes
    - Column is nullable since not all wins will have polished versions
    - Uses text type with check constraint to ensure valid values
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wins' AND column_name = 'polish_style'
  ) THEN
    ALTER TABLE wins ADD COLUMN polish_style text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'polish_style_check'
  ) THEN
    ALTER TABLE wins ADD CONSTRAINT polish_style_check
      CHECK (polish_style IN ('resume', 'review', 'linkedin') OR polish_style IS NULL);
  END IF;
END $$;