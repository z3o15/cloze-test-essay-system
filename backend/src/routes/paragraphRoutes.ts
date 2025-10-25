import { Router } from 'express'
import { ParagraphController } from '../controllers/paragraphController'

const router = Router()

// 段落相关路由
router.get('/paragraphs', ParagraphController.getAllParagraphs)
router.get('/paragraphs/:id', ParagraphController.getParagraphById)
router.post('/paragraphs', ParagraphController.createParagraph)
router.put('/paragraphs/:id', ParagraphController.updateParagraph)
router.delete('/paragraphs/:id', ParagraphController.deleteParagraph)
router.post('/paragraphs/batch', ParagraphController.batchSaveParagraphs)

export default router