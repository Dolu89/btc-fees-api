
import express from 'express'
import { getFastetFees } from './src/fees.js'
const app = express()
const port = 3000

app.get('/', async (req, res) => {
  res.json({ fastestFee: await getFastetFees() })
})

app.listen(port, () => {
  console.log(`Bitcoin fees API listening at http://localhost:${port}`)
})
