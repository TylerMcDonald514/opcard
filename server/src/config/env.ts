import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT ?? 3001),
  dbPath: process.env.DB_PATH ?? './data/opcard.db',
}
