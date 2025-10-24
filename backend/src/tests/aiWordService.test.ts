import { EnhancedWordService } from '../services/enhancedWordService';

// Mock dependencies
jest.mock('../services/volcanoAIService', () => ({
  VolcanoAIService: {
    judgeWordDifficulty: jest.fn(),
    batchJudgeWordDifficulty: jest.fn(),
  }
}));

jest.mock('../services/tencentTranslationService', () => ({
  TencentTranslationService: {
    translateWord: jest.fn(),
    batchTranslateWords: jest.fn(),
  }
}));

jest.mock('../repositories/wordRepository', () => ({
  WordRepository: jest.fn().mockImplementation(() => ({
    findByWord: jest.fn(),
    createComplete: jest.fn(),
    batchCheckExists: jest.fn(),
  }))
}));

jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }
}));

describe('EnhancedWordService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('filterComplexWords', () => {
    it('应该过滤出难度等级大于3的单词', async () => {
      // Arrange
      const words = ['simple', 'complex', 'sophisticated'];
      
      // Mock getWordInfo to return words with different difficulty levels
      const getWordInfoSpy = jest.spyOn(EnhancedWordService, 'getWordInfo');
      getWordInfoSpy.mockImplementation(async (word: string) => {
        switch (word) {
          case 'simple':
            return { word: 'simple', difficultyLevel: 2 };
          case 'complex':
            return { word: 'complex', difficultyLevel: 6 };
          case 'sophisticated':
            return { word: 'sophisticated', difficultyLevel: 8 };
          default:
            return null;
        }
      });

      // Act
      const complexWords = await EnhancedWordService.filterComplexWords(words);

      // Assert
      expect(complexWords.map(w => w.word)).toEqual(['complex', 'sophisticated']);
    });
  });

  describe('shouldShowTranslation', () => {
    it('应该为难度等级大于3的单词返回true', () => {
      // Arrange
      const wordInfo = {
        word: 'sophisticated',
        difficultyLevel: 8
      };

      // Act
      const result = EnhancedWordService.shouldShowTranslationByInfo(wordInfo);

      // Assert
      expect(result).toBe(true);
    });

    it('应该为难度等级小于等于3的单词返回false', () => {
      // Arrange
      const wordInfo = {
        word: 'simple',
        difficultyLevel: 2
      };

      // Act
      const result = EnhancedWordService.shouldShowTranslationByInfo(wordInfo);

      // Assert
      expect(result).toBe(false);
    });

    it('应该为没有难度等级的单词返回false', () => {
      // Arrange
      const wordInfo = {
        word: 'unknown'
      };

      // Act
      const result = EnhancedWordService.shouldShowTranslationByInfo(wordInfo);

      // Assert
      expect(result).toBe(false);
    });
  });
});