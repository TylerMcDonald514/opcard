import { Router } from 'express'
import { holdingController } from '../controllers/holdingController'

export const holdingsRouter = Router()
holdingsRouter.get('/', holdingController.list)
holdingsRouter.post('/', holdingController.create)
holdingsRouter.delete('/:id', holdingController.delete)
