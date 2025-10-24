import { logger } from '@/utils/logger';

// 单词难度等级定义
export enum WordDifficultyLevel {
  VERY_EASY = 1,    // 最简单 (a, the, is, am, are, etc.)
  EASY = 2,         // 简单 (basic verbs, common nouns)
  BASIC = 3,        // 基础 (everyday vocabulary)
  INTERMEDIATE = 4, // 中等 (high school level)
  ADVANCED = 5,     // 高级 (college level)
  EXPERT = 6,       // 专家级 (academic/professional)
  VERY_ADVANCED = 7,// 非常高级
  ACADEMIC = 8,     // 学术级
  SPECIALIZED = 9,  // 专业级
  RARE = 10         // 罕见词汇
}

// 常见简单词汇列表 (难度等级 ≤ 4)
const SIMPLE_WORDS_SET = new Set([
  // Level 1 - 最基础词汇
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'this', 'that', 'these', 'those',
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could', 'should',
  'not', 'no', 'yes',
  
  // Level 2 - 基础动词和名词
  'go', 'come', 'get', 'give', 'take', 'make', 'see', 'know', 'think', 'say', 'tell',
  'want', 'need', 'like', 'love', 'hate', 'help', 'work', 'play', 'eat', 'drink',
  'man', 'woman', 'boy', 'girl', 'child', 'people', 'person', 'family', 'friend',
  'house', 'home', 'school', 'work', 'time', 'day', 'year', 'way', 'life', 'world',
  'good', 'bad', 'big', 'small', 'new', 'old', 'long', 'short', 'high', 'low',
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  
  // Level 3 - 日常词汇
  'about', 'after', 'again', 'all', 'also', 'any', 'back', 'because', 'before',
  'between', 'both', 'down', 'during', 'each', 'even', 'every', 'few', 'find',
  'first', 'from', 'great', 'group', 'hand', 'here', 'how', 'into', 'just',
  'last', 'left', 'let', 'look', 'may', 'most', 'move', 'much', 'must', 'name',
  'never', 'next', 'now', 'number', 'off', 'often', 'only', 'other', 'over',
  'own', 'part', 'place', 'point', 'put', 'right', 'same', 'seem', 'show',
  'since', 'some', 'still', 'such', 'system', 'than', 'then', 'there', 'through',
  'too', 'turn', 'under', 'until', 'up', 'use', 'very', 'water', 'well', 'what',
  'when', 'where', 'which', 'while', 'who', 'why', 'without', 'word', 'write',
  
  // Level 4 - 中等难度词汇
  'able', 'above', 'across', 'add', 'against', 'almost', 'alone', 'along',
  'already', 'although', 'always', 'among', 'another', 'answer', 'appear',
  'around', 'ask', 'away', 'become', 'begin', 'believe', 'below', 'best',
  'better', 'black', 'book', 'bring', 'build', 'business', 'call', 'car',
  'carry', 'case', 'change', 'city', 'close', 'color', 'company', 'consider',
  'control', 'country', 'course', 'create', 'cut', 'decide', 'develop',
  'different', 'door', 'early', 'education', 'end', 'enough', 'example',
  'face', 'fact', 'far', 'feel', 'field', 'figure', 'follow', 'form',
  'free', 'full', 'game', 'general', 'government', 'grow', 'happen', 'head',
  'health', 'hear', 'hold', 'hope', 'hour', 'however', 'human', 'idea',
  'important', 'include', 'increase', 'information', 'inside', 'instead',
  'interest', 'issue', 'job', 'keep', 'kind', 'large', 'late', 'law',
  'lead', 'learn', 'leave', 'level', 'line', 'list', 'little', 'live',
  'local', 'lose', 'lot', 'love', 'low', 'machine', 'major', 'manage',
  'market', 'matter', 'mean', 'meet', 'member', 'mind', 'minute', 'money',
  'month', 'more', 'morning', 'mother', 'music', 'national', 'nature',
  'near', 'necessary', 'night', 'nothing', 'notice', 'open', 'order',
  'organization', 'page', 'paper', 'parent', 'pay', 'plan', 'plant',
  'policy', 'political', 'possible', 'power', 'present', 'president',
  'pressure', 'price', 'private', 'probably', 'problem', 'process',
  'produce', 'product', 'program', 'provide', 'public', 'purpose',
  'question', 'quite', 'rather', 'reach', 'read', 'real', 'really',
  'reason', 'receive', 'record', 'red', 'remember', 'report', 'represent',
  'require', 'research', 'resource', 'respond', 'result', 'return', 'run',
  'save', 'school', 'science', 'second', 'section', 'send', 'sense',
  'series', 'serious', 'serve', 'service', 'set', 'several', 'side',
  'simple', 'site', 'situation', 'size', 'social', 'society', 'sort',
  'space', 'speak', 'special', 'specific', 'spend', 'staff', 'stage',
  'standard', 'start', 'state', 'statement', 'step', 'stop', 'story',
  'strategy', 'street', 'strong', 'structure', 'student', 'study',
  'success', 'support', 'sure', 'table', 'talk', 'task', 'tax', 'teach',
  'teacher', 'team', 'technology', 'television', 'term', 'test', 'thank',
  'theory', 'thing', 'third', 'thought', 'thousand', 'today', 'together',
  'tonight', 'top', 'total', 'toward', 'town', 'trade', 'training',
  'travel', 'treat', 'treatment', 'tree', 'trial', 'true', 'try', 'type',
  'understand', 'union', 'university', 'upon', 'value', 'various', 'view',
  'visit', 'voice', 'vote', 'wait', 'walk', 'wall', 'war', 'watch',
  'week', 'weight', 'white', 'whole', 'wide', 'wife', 'win', 'window',
  'wish', 'within', 'woman', 'wonder', 'worker', 'working', 'worry',
  'wrong', 'young'
]);

export class WordDifficultyService {
  
  /**
   * 判断单词是否为简单词汇 (难度等级 ≤ 3)
   * @param word 要检查的单词
   * @returns 如果是简单词汇返回true，否则返回false
   */
  public static isSimpleWord(word: string): boolean {
    if (!word || typeof word !== 'string') {
      return true; // 无效输入视为简单词汇，需要过滤
    }
    
    const normalizedWord = word.toLowerCase().trim();
    
    // 过滤掉太短或太长的词
    if (normalizedWord.length <= 1 || normalizedWord.length > 20) {
      return true;
    }
    
    // 基于难度等级判断：难度等级 ≤ 3 的词汇为简单词汇
    const difficultyLevel = this.getWordDifficultyLevel(word);
    return difficultyLevel <= WordDifficultyLevel.BASIC; // BASIC = 3
  }
  
  /**
   * 获取单词的难度等级
   * @param word 要评估的单词
   * @returns 难度等级 (1-10)
   */
  public static getWordDifficultyLevel(word: string): WordDifficultyLevel {
    if (!word || typeof word !== 'string') {
      return WordDifficultyLevel.VERY_EASY;
    }
    
    const normalizedWord = word.toLowerCase().trim();
    
    // 基于词长度的初步判断
    if (normalizedWord.length <= 2) {
      return WordDifficultyLevel.VERY_EASY;
    }
    
    // 简单词汇集合中的词汇分配到1-3级
    if (SIMPLE_WORDS_SET.has(normalizedWord)) {
      // 根据词长度细分简单词汇的难度
      if (normalizedWord.length <= 3) {
        return WordDifficultyLevel.VERY_EASY; // 1级：a, the, is, am, are等
      } else if (normalizedWord.length <= 5) {
        return WordDifficultyLevel.EASY; // 2级：basic verbs, common nouns
      } else {
        return WordDifficultyLevel.BASIC; // 3级：everyday vocabulary
      }
    }
    
    // 非简单词汇从4级开始，基于词长度和复杂度的启发式判断
    if (normalizedWord.length <= 4) {
      return WordDifficultyLevel.INTERMEDIATE; // 4级
    } else if (normalizedWord.length <= 6) {
      return WordDifficultyLevel.ADVANCED; // 5级
    } else if (normalizedWord.length <= 8) {
      return WordDifficultyLevel.EXPERT; // 6级
    } else if (normalizedWord.length <= 10) {
      return WordDifficultyLevel.VERY_ADVANCED; // 7级
    } else if (normalizedWord.length <= 12) {
      return WordDifficultyLevel.ACADEMIC; // 8级
    } else if (normalizedWord.length <= 15) {
      return WordDifficultyLevel.SPECIALIZED; // 9级
    } else {
      return WordDifficultyLevel.RARE; // 10级
    }
  }
  
  /**
   * 过滤掉简单词汇，只保留难度等级 > 4 的词汇
   * @param words 待过滤的单词数组
   * @returns 过滤后的单词数组
   */
  public static filterComplexWords(words: string[]): string[] {
    if (!Array.isArray(words)) {
      return [];
    }
    
    const filteredWords = words.filter(word => {
      const isSimple = this.isSimpleWord(word);
      if (isSimple) {
        logger.debug(`过滤简单词汇: ${word}`);
      }
      return !isSimple;
    });
    
    // 去重处理
    const uniqueWords = [...new Set(filteredWords)];
    
    logger.info(`单词过滤完成: 原始${words.length}个 -> 过滤后${uniqueWords.length}个`);
    
    return uniqueWords;
  }
  
  /**
   * 批量获取单词难度等级
   * @param words 单词数组
   * @returns 单词及其难度等级的映射
   */
  public static batchGetWordDifficulty(words: string[]): Map<string, WordDifficultyLevel> {
    const difficultyMap = new Map<string, WordDifficultyLevel>();
    
    words.forEach(word => {
      const difficulty = this.getWordDifficultyLevel(word);
      difficultyMap.set(word, difficulty);
    });
    
    return difficultyMap;
  }
  
  /**
   * 获取难度等级的描述
   * @param level 难度等级
   * @returns 难度等级描述
   */
  public static getDifficultyDescription(level: WordDifficultyLevel): string {
    const descriptions = {
      [WordDifficultyLevel.VERY_EASY]: '非常简单',
      [WordDifficultyLevel.EASY]: '简单',
      [WordDifficultyLevel.BASIC]: '基础',
      [WordDifficultyLevel.INTERMEDIATE]: '中等',
      [WordDifficultyLevel.ADVANCED]: '高级',
      [WordDifficultyLevel.EXPERT]: '专家级',
      [WordDifficultyLevel.VERY_ADVANCED]: '非常高级',
      [WordDifficultyLevel.ACADEMIC]: '学术级',
      [WordDifficultyLevel.SPECIALIZED]: '专业级',
      [WordDifficultyLevel.RARE]: '罕见'
    };
    
    return descriptions[level] || '未知';
  }
}