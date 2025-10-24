import { Router } from 'express';
import { body } from 'express-validator';
import { Request, Response } from 'express';
import { EnhancedPassageTranslationService } from '@/services/enhancedPassageTranslationService';
import { logger } from '@/utils/logger';
import { pool } from '@/config/database';

const router = Router();

/**
 * @route POST /api/essay/process
 * @desc 处理完整文章 - 段落翻译 + 单词提取
 * @access Public
 */
router.post('/essay/process', [
    body('text').notEmpty().withMessage('文章内容不能为空'),
    body('title').optional().isString().withMessage('标题必须是字符串')
], async (req: Request, res: Response) => {
    try {
        const { text: content, title = '未命名文章' } = req.body;

        logger.info('开始处理文章', { title, contentLength: content.length });

        // 创建服务实例
        const enhancedService = new EnhancedPassageTranslationService(pool());

        // 将文章按段落分割
        const paragraphs = content
            .split(/\n\s*\n/)
            .map((p: string) => p.trim())
            .filter((p: string) => p.length > 0);

        const summary = {
            totalParagraphs: paragraphs.length,
            paragraphsTranslated: 0,
            totalWords: 0,
            unknownWordsTranslated: 0,
            wordsCreated: 0,
            errors: [] as string[]
        };

        // 处理每个段落
        for (let i = 0; i < paragraphs.length; i++) {
            const paragraph = paragraphs[i];
            
            try {
                logger.debug(`处理第${i + 1}个段落`, { paragraph: paragraph.substring(0, 50) });
                
                const result = await enhancedService.enhancedTranslate(paragraph);
                
                summary.paragraphsTranslated++;
                summary.totalWords += paragraph.split(/\s+/).length;
                summary.unknownWordsTranslated += result.wordTranslations?.length || 0;
                summary.wordsCreated += result.wordTranslations?.length || 0;
                
                logger.debug(`第${i + 1}个段落处理完成`, { 
                    wordCount: result.wordTranslations?.length || 0 
                });
                
            } catch (error) {
                const errorMsg = `段落${i + 1}处理失败: ${error instanceof Error ? error.message : '未知错误'}`;
                summary.errors.push(errorMsg);
                logger.error(errorMsg, error);
            }
        }

        logger.info('文章处理完成', summary);

        res.json({
            success: true,
            data: {
                title,
                summary,
                message: '文章处理完成'
            }
        });

    } catch (error) {
        logger.error('文章处理失败:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '文章处理失败'
        });
    }
});

export default router;