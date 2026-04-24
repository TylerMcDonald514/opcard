import { Router } from 'express'
import { cardController } from '../controllers/cardController'

export const cardsRouter = Router()
cardsRouter.get('/', cardController.list)
cardsRouter.post('/', cardController.create)
