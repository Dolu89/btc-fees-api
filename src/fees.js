import axios from 'axios'

// Block time confirmation in seconds
const BLOCK_TIME_CONFIRMATION = 600

export async function getData () {
  const mempoolBlocksPromise = axios.get('https://mempool.space/api/v1/fees/mempool-blocks')
  const { data: lastBlockHash } = await axios.get('https://mempool.space/api/blocks/tip/hash')
  const { data: lastBlock } = await axios.get(`https://mempool.space/api/block/${lastBlockHash}`)

  const currentTimestamp = Math.round(new Date().getTime() / 1000)
  const percentSinceLastBlock = getPercentTimeSinceLastMinedBlock(currentTimestamp, lastBlock.timestamp)

  const { data: memPoolBlocks } = await mempoolBlocksPromise
  const fastestFee = calculateFastestFee(memPoolBlocks, percentSinceLastBlock)
  return { fastestFee, nextBlock: memPoolBlocks[0], timeSinceLastBlock: currentTimestamp - lastBlock.timestamp }
}

function getPercentTimeSinceLastMinedBlock (currentTimestamp, blockMinedTime) {
  const secondsSinceLastBlock = currentTimestamp - blockMinedTime
  return (secondsSinceLastBlock / BLOCK_TIME_CONFIRMATION) * 100
}

function calculateFastestFee (memPoolBlocks, percentSinceLastBlock) {
  const reversePercent = percentSinceLastBlock < 100 ? 100 - percentSinceLastBlock : 0
  let fee = 0
  if (memPoolBlocks.length > 0 && memPoolBlocks[0].feeRange.length > 1) {
    const nextBlock = memPoolBlocks[0]
    // First : Take the lowest fee
    const difference = nextBlock.feeRange[1] - nextBlock.feeRange[0]
    const lowestFee = nextBlock.feeRange[0] + (difference / 2)

    // Second : Define the range where to apply percentage (range fee / 2)
    const highestFee = nextBlock.feeRange[Math.trunc(nextBlock.feeRange.length / 2)]

    // Third : Apply percentage between the lowest fee and the highest fee
    fee = (reversePercent * (highestFee - lowestFee)) / 100 + lowestFee
  }
  return fee
}
