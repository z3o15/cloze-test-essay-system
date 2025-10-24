// 翻译系统模块化入口文件
// 统一导出所有模块和工厂函数

// 类型定义
export * from './types'

// 模块类
export { ParagraphProcessor, createParagraphProcessor } from './paragraphProcessor'
export { WordTranslator, createWordTranslator } from './wordTranslator'
export { DatabaseService, createDatabaseService } from './databaseService'
export { TranslationController, createTranslationController } from './translationController'

// 便捷的工厂函数，创建完整的翻译系统
import { createParagraphProcessor } from './paragraphProcessor'
import { createWordTranslator } from './wordTranslator'
import { createDatabaseService } from './databaseService'
import { createTranslationController } from './translationController'
import type { TranslationConfig } from './types'

/**
 * 创建完整的翻译系统实例
 * @param config 配置选项
 * @returns 翻译控制器实例
 */
export const createTranslationSystem = (config?: Partial<TranslationConfig>) => {
  // 创建各个模块实例
  const databaseService = createDatabaseService()
  const wordTranslator = createWordTranslator(config)
  const paragraphProcessor = createParagraphProcessor(wordTranslator)
  const translationController = createTranslationController(
    paragraphProcessor,
    wordTranslator,
    databaseService,
    config
  )

  return {
    controller: translationController,
    paragraphProcessor,
    wordTranslator,
    databaseService
  }
}

/**
 * 默认翻译系统实例
 * 可以直接使用，无需手动创建
 */
export const defaultTranslationSystem = createTranslationSystem()

// 便捷的导出函数，保持与原有API的兼容性
export const processEssayAfterSave = defaultTranslationSystem.controller.processEssayAfterSave.bind(defaultTranslationSystem.controller)
export const processEssayAsync = defaultTranslationSystem.controller.processEssayAsync.bind(defaultTranslationSystem.controller)
export const preloadWordTranslations = defaultTranslationSystem.controller.preloadWordTranslations.bind(defaultTranslationSystem.controller)

// 导出翻译相关函数，保持兼容性
export const translateText = defaultTranslationSystem.wordTranslator.translateText.bind(defaultTranslationSystem.wordTranslator)
export const translateBatch = defaultTranslationSystem.wordTranslator.translateBatch.bind(defaultTranslationSystem.wordTranslator)
export const translateWord = defaultTranslationSystem.wordTranslator.translateWord.bind(defaultTranslationSystem.wordTranslator)

// 导出数据库相关函数，保持兼容性
export const saveTranslationToDatabase = defaultTranslationSystem.databaseService.saveTranslationToDatabase.bind(defaultTranslationSystem.databaseService)
export const saveTranslationsBatch = defaultTranslationSystem.databaseService.saveTranslationsBatch.bind(defaultTranslationSystem.databaseService)
export const queryWordFromDatabase = defaultTranslationSystem.databaseService.queryWordFromDatabase.bind(defaultTranslationSystem.databaseService)

// 导出段落处理相关函数，保持兼容性
export const tokenizeText = defaultTranslationSystem.paragraphProcessor.tokenizeText.bind(defaultTranslationSystem.paragraphProcessor)
export const extractWords = defaultTranslationSystem.paragraphProcessor.extractWords.bind(defaultTranslationSystem.paragraphProcessor)

// 工具函数
export const getTranslationSystemStats = () => defaultTranslationSystem.controller.getStats()
export const clearAllTranslationCaches = () => defaultTranslationSystem.controller.clearAllCaches()
export const updateTranslationConfig = (config: Partial<TranslationConfig>) => defaultTranslationSystem.controller.updateConfig(config)