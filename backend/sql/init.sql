-- 完形填空系统数据库初始化脚本
-- 包含单词表、段落表和翻译表

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建单词表
CREATE TABLE IF NOT EXISTS words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word VARCHAR(255) NOT NULL UNIQUE,
    pronunciation VARCHAR(500),
    definition TEXT,
    translation TEXT,
    part_of_speech VARCHAR(50),
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
    frequency_rank INTEGER,
    example_sentences TEXT[],
    synonyms TEXT[],
    antonyms TEXT[],
    etymology TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建段落表
CREATE TABLE IF NOT EXISTS paragraphs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    english_content TEXT NOT NULL,
    translation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建翻译表
CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    source_language VARCHAR(10) DEFAULT 'en',
    target_language VARCHAR(10) DEFAULT 'zh',
    service VARCHAR(50) DEFAULT 'volcano',
    cache_key VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
-- 单词表索引
CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
CREATE INDEX IF NOT EXISTS idx_words_difficulty_level ON words(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_words_part_of_speech ON words(part_of_speech);
CREATE INDEX IF NOT EXISTS idx_words_frequency_rank ON words(frequency_rank);
CREATE INDEX IF NOT EXISTS idx_words_is_active ON words(is_active);
CREATE INDEX IF NOT EXISTS idx_words_created_at ON words(created_at);

-- 段落表索引
CREATE INDEX IF NOT EXISTS idx_paragraphs_title ON paragraphs(title);
CREATE INDEX IF NOT EXISTS idx_paragraphs_created_at ON paragraphs(created_at);

-- 翻译表索引
CREATE INDEX IF NOT EXISTS idx_translations_source_text ON translations(source_text);
CREATE INDEX IF NOT EXISTS idx_translations_service ON translations(service);
CREATE INDEX IF NOT EXISTS idx_translations_cache_key ON translations(cache_key);
CREATE INDEX IF NOT EXISTS idx_translations_created_at ON translations(created_at);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为表创建更新时间触发器
CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON words FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_paragraphs_updated_at BEFORE UPDATE ON paragraphs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 表注释
COMMENT ON TABLE words IS '单词表 - 存储单词的详细信息包括释义、难度等';
COMMENT ON TABLE paragraphs IS '段落表 - 存储英文段落及其翻译';
COMMENT ON TABLE translations IS '翻译表 - 存储翻译历史记录';

COMMENT ON COLUMN words.word IS '英文单词';
COMMENT ON COLUMN words.pronunciation IS '音标';
COMMENT ON COLUMN words.definition IS '英文定义';
COMMENT ON COLUMN words.translation IS '中文释义';
COMMENT ON COLUMN words.difficulty_level IS '难度级别(1-10)';
COMMENT ON COLUMN paragraphs.title IS '段落标题';
COMMENT ON COLUMN paragraphs.english_content IS '英文内容';
COMMENT ON COLUMN paragraphs.translation IS '中文翻译';



-- 数据库初始化完成
SELECT 'Simplified word database initialization completed successfully!' as status;