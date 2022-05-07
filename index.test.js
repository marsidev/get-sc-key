const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('./index')
const should = chai.should()

chai.use(chaiHttp)

const { EMAIL, PASSWORD } = process.env
const WHITELIST = ['my whitelisted API', 'my other whitelisted key']
const FIXED_IP = '11.22.33.44'

// const gameIDs = ['coc', 'clashofclans', 'bs', 'brawlstars']
const gameIDs = ['cr', 'coc', 'bs', 'clashroyale', 'clashofclans', 'brawlstars']

// we assume same credentials in all game APIs
const CREDENTIALS = {
  email: EMAIL,
  password: PASSWORD
}

describe('/POST without providing required props', () => {
  it('-no game', done => {
    chai
      .request(server)
      .post('/')
      .send(CREDENTIALS)
      .end((err, res) => {
        const { body } = res
        if (err) done(err)

        res.should.have.status(400)
        body.should.be.a('object')
        body.should.have.property('error').eql('game id is required')
        done()
      })
  })

  it('-no email', done => {
    chai
      .request(server)
      .post('/')
      .send({ password: PASSWORD })
      .end((err, res) => {
        const { body } = res
        if (err) done(err)

        res.should.have.status(400)
        body.should.be.a('object')
        body.should.have
          .property('error')
          .eql('email and password are required')
        done()
      })
  })

  it('-no password', done => {
    chai
      .request(server)
      .post('/')
      .send({ email: EMAIL })
      .end((err, res) => {
        const { body } = res
        if (err) done(err)

        res.should.have.status(400)
        body.should.be.a('object')
        body.should.have
          .property('error')
          .eql('email and password are required')
        done()
      })
  })

  it('-non-valid game id', done => {
    chai
      .request(server)
      .post('/')
      .send({ ...CREDENTIALS, game: 'non-valid' })
      .end((err, res) => {
        const { body } = res
        if (err) done(err)

        res.should.have.status(400)
        body.should.be.a('object')
        body.should.have
          .property('error')
          .eql('game id must be either "clashroyale", "clashofclans", "brawlstars", "cr", "coc" or "bs"')
        done()
      })
  })
})

describe('/POST with non-valid credentials', () => {
  it('-wrong email', done => {
    chai
      .request(server)
      .post('/')
      .send({ ...CREDENTIALS, email: 'non-valid', game: 'cr' })
      .end((err, res) => {
        const { body } = res
        if (err) done(err)

        res.should.have.status(401)
        body.should.be.a('object')
        body.should.have.property('error').eql('login')
        body.should.have
          .property('description')
          .eql('Invalid email or password.')
        done()
      })
  })

  it('-wrong password', done => {
    chai
      .request(server)
      .post('/')
      .send({ ...CREDENTIALS, password: 'non-valid', game: 'cr' })
      .end((err, res) => {
        const { body } = res
        if (err) done(err)

        res.should.have.status(401)
        body.should.be.a('object')
        body.should.have.property('error').eql('login')
        body.should.have
          .property('description')
          .eql('Invalid email or password.')
        done()
      })
  })
})

describe('/POST with valid credentials', () => {
  describe('fixedIp=false, whitelist=false', () => {
    gameIDs.forEach(game => {
      it(`-${game}`, done => {
        const creds = { ...CREDENTIALS, game }

        chai
          .request(server)
          .post('/')
          .send(creds)
          .end((err, res) => {
            const { body } = res
            if (err) done(err)
            // console.log(body)

            res.should.have.status(200)
            body.should.be.a('object')
            body.should.have.property('name')
            body.should.have.property('description')
            body.should.have
              .property('description')
              .eql('Key for non-commercial use')
            body.should.have.property('ipRange')
            body.should.have.property('key')
            body.ipRange.should.be.a('array')
            body.ipRange.length.should.be.eql(1)
            // creds.fixedIp && res.body.ipRange[0].should.be.eql(creds.fixedIp)
            done()
          })
      })
    })
  })

  describe('fixedIp=true, whitelist=false', () => {
    gameIDs.forEach(game => {
      it(`-${game}`, done => {
        const creds = { ...CREDENTIALS, game, fixedIp: FIXED_IP }

        chai
          .request(server)
          .post('/')
          .send(creds)
          .end((err, res) => {
            const { body } = res
            if (err) done(err)
            // console.log(body)

            res.should.have.status(200)
            body.should.be.a('object')
            body.should.have.property('name')
            body.should.have.property('description')
            body.should.have
              .property('description')
              .eql('Key for non-commercial use')
            body.should.have.property('ipRange')
            body.should.have.property('key')
            body.ipRange.should.be.a('array')
            body.ipRange.length.should.be.eql(1)
            res.body.ipRange[0].should.be.eql(creds.fixedIp)
            done()
          })
      })
    })
  })

  describe('fixedIp=false, whitelist=true', () => {
    gameIDs.forEach(game => {
      it(`-${game}`, done => {
        const creds = { ...CREDENTIALS, game, whitelist: WHITELIST }

        chai
          .request(server)
          .post('/')
          .send(creds)
          .end((err, res) => {
            const { body } = res
            if (err) done(err)
            // console.log(body)

            res.should.have.status(200)
            body.should.be.a('object')
            body.should.have.property('name')
            body.should.have.property('description')
            body.should.have
              .property('description')
              .eql('Key for non-commercial use')
            body.should.have.property('ipRange')
            body.should.have.property('key')
            body.ipRange.should.be.a('array')
            body.ipRange.length.should.be.eql(1)
            // res.body.ipRange[0].should.be.eql(creds.fixedIp)
            done()
          })
      })
    })
  })

  describe('fixedIp=true, whitelist=true', () => {
    gameIDs.forEach(game => {
      it(`-${game}`, done => {
        const creds = {
          ...CREDENTIALS,
          game,
          fixedIp: FIXED_IP,
          whitelist: WHITELIST
        }

        chai
          .request(server)
          .post('/')
          .send(creds)
          .end((err, res) => {
            const { body } = res
            if (err) done(err)
            // console.log(body)

            res.should.have.status(200)
            body.should.be.a('object')
            body.should.have.property('name')
            body.should.have.property('description')
            body.should.have
              .property('description')
              .eql('Key for non-commercial use')
            body.should.have.property('ipRange')
            body.should.have.property('key')
            body.ipRange.should.be.a('array')
            body.ipRange.length.should.be.eql(1)
            res.body.ipRange[0].should.be.eql(creds.fixedIp)
            done()
          })
      })
    })
  })
})
