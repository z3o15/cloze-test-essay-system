-- 创建单词表
CREATE TABLE IF NOT EXISTS words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word VARCHAR(255) NOT NULL UNIQUE,
    pronunciation VARCHAR(500),
    definition TEXT,
    meaning TEXT,
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
CREATE INDEX IF NOT EXISTS idx_words_difficulty_level ON words(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_words_part_of_speech ON words(part_of_speech);
CREATE INDEX IF NOT EXISTS idx_words_frequency_rank ON words(frequency_rank);
CREATE INDEX IF NOT EXISTS idx_words_is_active ON words(is_active);
CREATE INDEX IF NOT EXISTS idx_words_created_at ON words(created_at);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_words_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_words_updated_at
    BEFORE UPDATE ON words
    FOR EACH ROW
    EXECUTE FUNCTION update_words_updated_at();

-- 插入一些示例数据
INSERT INTO words (word, pronunciation, definition, meaning, part_of_speech, difficulty_level, frequency_rank, example_sentences, synonyms, antonyms) VALUES
('hello', '/həˈloʊ/', 'Used as a greeting or to begin a phone conversation', '你好', 'interjection', 1, 100, ARRAY['Hello, how are you?', 'She said hello to everyone.'], ARRAY['hi', 'greetings'], ARRAY['goodbye', 'farewell']),
('world', '/wɜːrld/', 'The earth, together with all of its countries and peoples', '世界', 'noun', 2, 200, ARRAY['The world is a beautiful place.', 'He traveled around the world.'], ARRAY['earth', 'globe', 'planet'], ARRAY[]::text[]),
('reading', '/ˈriːdɪŋ/', 'The action or skill of reading written or printed matter silently or aloud', '阅读', 'noun', 3, 300, ARRAY['Reading is fundamental to learning.', 'She enjoys reading novels.'], ARRAY['perusal', 'study'], ARRAY['writing']),
('chapter', '/ˈtʃæptər/', 'A section of a book, typically with a number or title', '章节', 'noun', 3, 400, ARRAY['Read chapter 5 for homework.', 'This chapter discusses grammar.'], ARRAY['section', 'part'], ARRAY[]::text[]),
('infinite', '/ˈɪnfɪnət/', 'Limitless or endless in space, extent, or size; impossible to measure or calculate', '无限的', 'adjective', 5, 1500, ARRAY['The universe seems infinite.', 'There are infinite possibilities.'], ARRAY['endless', 'limitless', 'boundless'], ARRAY['finite', 'limited']),
('reminder', '/rɪˈmaɪndər/', 'A thing that causes someone to remember something', '提醒', 'noun', 4, 800, ARRAY['Set a reminder for the meeting.', 'This photo is a reminder of our trip.'], ARRAY['prompt', 'cue'], ARRAY[]::text[]),
('anything', '/ˈeniθɪŋ/', 'Used to refer to a thing, no matter what', '任何事物', 'pronoun', 2, 250, ARRAY['Is there anything I can help you with?', 'She can do anything she sets her mind to.'], ARRAY['something', 'everything'], ARRAY['nothing']),
('mysterious', '/mɪˈstɪriəs/', 'Difficult or impossible to understand, explain, or identify', '神秘的', 'adjective', 4, 1200, ARRAY['The old house had a mysterious atmosphere.', 'He gave her a mysterious smile.'], ARRAY['enigmatic', 'puzzling', 'cryptic'], ARRAY['clear', 'obvious', 'transparent']),
('sculptor', '/ˈskʌlptər/', 'An artist who makes sculptures', '雕塑家', 'noun', 5, 2000, ARRAY['The sculptor worked with marble.', 'She is a famous sculptor.'], ARRAY['artist', 'carver'], ARRAY[]::text[]),
('harvest', '/ˈhɑːrvɪst/', 'The process or period of gathering in crops', '收获', 'noun', 4, 1000, ARRAY['The harvest was abundant this year.', 'Farmers work hard during harvest time.'], ARRAY['crop', 'yield', 'gathering'], ARRAY['planting', 'sowing'])
ON CONFLICT (word) DO NOTHING;