import { Router } from 'express'
import { priceController } from '../controllers/priceController'

export const pricesRouter = Router()
pricesRouter.post('/refresh', priceController.refresh)
pricesRouter.get('/:cardId', priceController.getByCard)
