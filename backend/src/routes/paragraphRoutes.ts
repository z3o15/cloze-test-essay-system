import { Router } from 'express'
import { ParagraphController } from '@/controllers/paragraphController'

const router = Router()
const controller = new ParagraphController()

// 段落批量保存
router.post('/paragraphs/batch', controller.batchSave)

export default router
