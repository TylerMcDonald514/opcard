import { Router } from 'express'
import { dashboardController } from '../controllers/dashboardController'

export const dashboardRouter = Router()
dashboardRouter.get('/summary', dashboardController.summary)
