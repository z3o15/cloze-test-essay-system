-- 简化版完形填空系统数据库初始化脚本
-- 核心功能：单词释义存储

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 简化的单词表 - 只保留核心字段
CREATE TABLE IF NOT EXISTS words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word VARCHAR(100) NOT NULL UNIQUE,
    pronunciation VARCHAR(200),
    meaning TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建单词表索引
CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
CREATE INDEX IF NOT EXISTS idx_words_created_at ON words(created_at);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为单词表创建更新时间触发器
CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON words FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



-- 表注释
COMMENT ON TABLE words IS '单词释义表 - 简化版，只存储核心释义信息';
COMMENT ON COLUMN words.word IS '英文单词';
COMMENT ON COLUMN words.pronunciation IS '音标（可选）';
COMMENT ON COLUMN words.meaning IS '中文释义';



-- 数据库初始化完成
SELECT 'Simplified word database initialization completed successfully!' as status;