
import express from 'express'
import WebSocket from 'ws'
import { getFastetFees } from './src/fees.js'
const app = express()
const port = 3000

app.get('/', async (req, res) => {
  res.json({ fastestFee: await getFastetFees() })
})

const server = app.listen(port, () => {
  console.log(`Bitcoin fees API listening at http://localhost:${port}`)
})

const wss = new WebSocket.Server({ server })

wss.on('connection', function connection (ws) {
  ws.send('Connected')
})

async function loopFees () {
  const fastestFees = await getFastetFees()
  wss.clients.forEach(async (client) => {
    if (client.readyState !== WebSocket.OPEN) {
      return
    }
    client.send(JSON.stringify({ fastestFees }))
  })
  setTimeout(loopFees, 3000)
}

loopFees()
