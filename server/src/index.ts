import { app } from './app'
import { config } from './config/env'

app.listen(config.port, () => {
  console.log(`[opcard] listening on :${config.port}`)
})
