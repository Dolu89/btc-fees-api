
import express from 'express'
import WebSocket from 'ws'
import { getData } from './src/fees.js'
const app = express()
const port = 3001

app.get('/', async (req, res) => {
  res.json(await getData())
})

const server = app.listen(port, () => {
  console.log(`Bitcoin fees API listening at http://localhost:${port}`)
})

const wss = new WebSocket.Server({ server })

wss.on('connection', function connection (ws) {
  ws.send('Connected')
})

async function loopFees () {
  const data = await getData()
  wss.clients.forEach(async (client) => {
    if (client.readyState !== WebSocket.OPEN) {
      return
    }
    client.send(JSON.stringify(data))
  })
  setTimeout(loopFees, 3000)
}

loopFees()
