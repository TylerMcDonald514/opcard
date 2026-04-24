import express from 'express'
import cors from 'cors'
import { apiRouter } from './routes'

export const app = express()

app.use(cors())
app.use(express.json())

app.use(cors({
  origin: '*'
}))

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/api', apiRouter)
