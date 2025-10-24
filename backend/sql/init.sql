-- 简化版完形填空系统数据库初始化脚本
-- 核心功能：单词翻译存储

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 简化的单词表 - 只保留核心字段
CREATE TABLE IF NOT EXISTS words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word VARCHAR(100) NOT NULL UNIQUE,
    pronunciation VARCHAR(200),
    translation TEXT NOT NULL,
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

-- 翻译历史表
CREATE TABLE IF NOT EXISTS translation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_text TEXT NOT NULL,
    target_text TEXT NOT NULL,
    source_lang VARCHAR(10) NOT NULL DEFAULT 'en',
    target_lang VARCHAR(10) NOT NULL DEFAULT 'zh',
    translation_service VARCHAR(50) NOT NULL DEFAULT 'tencent',
    user_ip INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建翻译历史表索引
CREATE INDEX IF NOT EXISTS idx_translation_history_source_text ON translation_history(source_text);
CREATE INDEX IF NOT EXISTS idx_translation_history_created_at ON translation_history(created_at);
CREATE INDEX IF NOT EXISTS idx_translation_history_service ON translation_history(translation_service);
CREATE INDEX IF NOT EXISTS idx_translation_history_lang_pair ON translation_history(source_lang, target_lang);

-- 为翻译历史表创建更新时间触发器
CREATE TRIGGER update_translation_history_updated_at BEFORE UPDATE ON translation_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 表注释
COMMENT ON TABLE words IS '单词翻译表 - 简化版，只存储核心翻译信息';
COMMENT ON COLUMN words.word IS '英文单词';
COMMENT ON COLUMN words.pronunciation IS '音标（可选）';
COMMENT ON COLUMN words.translation IS '中文翻译';

COMMENT ON TABLE translation_history IS '翻译历史记录表';
COMMENT ON COLUMN translation_history.source_text IS '原文';
COMMENT ON COLUMN translation_history.target_text IS '译文';
COMMENT ON COLUMN translation_history.source_lang IS '源语言';
COMMENT ON COLUMN translation_history.target_lang IS '目标语言';
COMMENT ON COLUMN translation_history.translation_service IS '翻译服务提供商';

-- 数据库初始化完成
SELECT 'Simplified word database initialization completed successfully!' as status;