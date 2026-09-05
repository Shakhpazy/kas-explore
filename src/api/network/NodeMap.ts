import axios from 'axios'

export async function getPublicNodeCount(signal?: AbortSignal) {
  const { data } = await axios.get<{
    default_port: number
    other_ports: number
    timestamp: string
  }>('https://nodes.kaspa.ws/data/aggs.json', { signal, timeout: 10_000 })
  if (
    !Number.isSafeInteger(data.default_port) ||
    data.default_port < 0 ||
    !Number.isSafeInteger(data.other_ports) ||
    data.other_ports < 0 ||
    !Number.isFinite(Date.parse(data.timestamp))
  )
    throw new Error('Invalid node map response')
  return {
    count: data.default_port + data.other_ports,
    updatedAt: data.timestamp,
  }
}
