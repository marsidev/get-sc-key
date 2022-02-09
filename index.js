const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const { login, getKeys, revokeKeys, createKey, getCookie, getIP } = require('./utils')

const app = express()
app.use(cors())
app.use(express.json())
morgan.token('body', req => JSON.stringify(req.body))
// app.use(morgan('dev'))
app.use(morgan(':method - :body - :status - :response-time ms'))

app.post('/', async (req, res) => {
  try {
    let { game } = req.body
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }

    if (!game) {
      return res.status(400).json({ error: 'game is required' })
    }

    if (game === 'cr') game = 'clashroyale'
    if (game === 'coc') game = 'clashofclans'
    if (game === 'bs') game = 'brawlstars'

    if (game !== 'clashroyale' && game !== 'clashofclans' && game !== 'brawlstars') {
      return res.status(400).json({ error: 'game must be either clashroyale, clashofclans or brawlstars' })
    }

    const baseUrl = `https://developer.${game}.com/api`

    // login
    const loginResponse = await login({ baseUrl, email, password })
    if (loginResponse.error) {
      return res.status(401).send(loginResponse)
    }

    // get cookie
    const cookie = await getCookie(loginResponse)

    // get current keys:
    const savedKeys = await getKeys({ baseUrl, cookie })

    // get current IP
    const ip = await getIP()

    // check if exists a key with the same IP:
    const keyWithSameIP = savedKeys.find(key => key.cidrRanges.includes(ip))

    let validApiKey
    if (keyWithSameIP) {
      validApiKey = keyWithSameIP
    } else {
      // get keys which are not for this IP
      const keysToRevoke = savedKeys.filter(key => !key.cidrRanges.includes(ip))

      // revoke all keys which are not for this IP
      await revokeKeys({ baseUrl, cookie, keysToRevoke })

      // create new key
      const newKey = await createKey({ baseUrl, cookie, ip })
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
