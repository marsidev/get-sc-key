require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const { login, getKeys, revokeKey, createKey, getCookie, getIP } = require('./utils')

const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.post('/', async (req, res) => {
  try {
    let { game } = req.body
    const { email, password, whitelist = [], fixedIp = '' } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }

    if (!game) {
      return res.status(400).json({ error: 'game id is required' })
    }

    if (game === 'cr') game = 'clashroyale'
    if (game === 'coc') game = 'clashofclans'
    if (game === 'bs') game = 'brawlstars'

    if (game !== 'clashroyale' && game !== 'clashofclans' && game !== 'brawlstars') {
      return res.status(400).json({ error: 'game id must be either "clashroyale", "clashofclans", "brawlstars", "cr", "coc" or "bs"' })
    }

    const baseUrl = `https://developer.${game}.com/api`

    // login
    const loginResponse = await login({ baseUrl, email, password })
    if (loginResponse?.error) {
      return res.status(401).send(loginResponse)
    }

    // get cookie
    const cookie = await getCookie(loginResponse)

    // get current keys:
    const savedKeys = await getKeys({ baseUrl, cookie })

    // get current IP
    const ip = fixedIp || await getIP()

    // check if exists a key with the same IP:
    const keyWithSameIP = savedKeys.find(key => key.cidrRanges.includes(ip))

    let validApiKey
    if (keyWithSameIP) {
      validApiKey = keyWithSameIP
    } else {
      // revoke the first key which is not whitelisted
      if (savedKeys.length === 10) {
        const keyToRevoke = savedKeys.find(key => !whitelist.includes(key.name))
        await revokeKey({ baseUrl, cookie, keyToRevoke })
      }

      // create new key
      const newKey = await createKey({ baseUrl, cookie, ips: [ip] })
      if (newKey?.error) {
        return res.status(500).send(newKey)
      }

      validApiKey = newKey.key
    }

    res.json({
      name: validApiKey.name,
      description: validApiKey.description,
      ipRange: validApiKey.cidrRanges,
      key: validApiKey.key
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error })
  }
})

const PORT = process.env.PORT || 1234
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app
