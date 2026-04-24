import { Router } from 'express'
import { cardsRouter } from './cards'
import { holdingsRouter } from './holdings'
import { pricesRouter } from './prices'
import { dashboardRouter } from './dashboard'

export const apiRouter = Router()
apiRouter.use('/cards', cardsRouter)
apiRouter.use('/holdings', holdingsRouter)
apiRouter.use('/prices', pricesRouter)
apiRouter.use('/dashboard', dashboardRouter)
