-- Create passage translations table
CREATE TABLE IF NOT EXISTS passage_translations (
    id SERIAL PRIMARY KEY,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'failed'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_passage_translations_source_text_hash ON passage_translations USING hash(md5(source_text));
CREATE INDEX IF NOT EXISTS idx_passage_translations_status ON passage_translations(status);
CREATE INDEX IF NOT EXISTS idx_passage_translations_created_at ON passage_translations(created_at DESC);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_passage_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER trigger_passage_translations_updated_at
    BEFORE UPDATE ON passage_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_passage_translations_updated_at();