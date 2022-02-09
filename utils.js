const axios = require('axios')

const login = async ({ baseUrl, email, password }) => {
  try {
    const url = `${baseUrl}/login`
    const payload = { email, password }
    const login = await axios.post(url, payload)
    return login
  } catch (error) {
    return error?.response?.data
  }
}

const getKeys = async ({ baseUrl, cookie }) => {
  try {
    const url = `${baseUrl}/apikey/list`
    const headers = { cookie }
    const response = await axios.post(url, {}, { headers })
    return response.data.keys
  } catch (error) {
    return error?.response?.data
  }
}

const revokeKey = async ({ baseUrl, cookie, keyToRevoke }) => {
  try {
    const url = `${baseUrl}/apikey/revoke`
    const headers = { cookie }
    const data = { id: keyToRevoke.id }
    await axios.post(url, data, { headers })
    // console.log(`key "${keyToRevoke.name}" revoked!`)
  } catch (error) {
    return error?.response?.data
  }
}

const revokeKeys = async ({ baseUrl, cookie, keysToRevoke }) => {
  try {
    const url = `${baseUrl}/apikey/revoke`
    const headers = { cookie }
    keysToRevoke.forEach(async key => {
      const data = { id: key.id }
      await axios.post(url, data, { headers })
    })
  } catch (error) {
    return error?.response?.data
  }
}

const createKey = async ({ baseUrl, cookie, ip }) => {
  try {
    const url = `${baseUrl}/apikey/create`
    const headers = { cookie }
    const payload = {
      cidrRanges: [ip],
      name: 'Key generated at ' + new Date().toISOString(),
      description: 'Key for non-commercial use'
    }
    const response = await axios.post(url, payload, { headers })
    return response.data
  } catch (error) {
    return error?.response?.data
  }
}

const getCookie = async loginResponse => {
  const sessionDetails = loginResponse.headers['set-cookie'][0]
  const cookie = `${sessionDetails}; game-api-url=${loginResponse.data.swaggerUrl};game-api-token=${loginResponse.data.temporaryAPIToken}`
  return cookie
}

const getIP = async () => {
  const url = 'https://api.ipify.org/'
  const response = await axios.get(url)
  return response.data
}

module.exports = {
  login,
  getKeys,
  revokeKey,
  revokeKeys,
  createKey,
  getCookie,
  getIP
}
