'use strict'
const cloudinary = require('cloudinary')
const Promise = require('bluebird')
const co = require('co')
const fs = Promise.promisifyAll(require('fs'))
const request = require('request')
const moment = require('moment')
// FILL THIS
cloudinary.config({ 
    cloud_name: 'hghz4zts3', 
    api_key: '871942984534813', 
    api_secret: 'viCT1gIlPtcy4273Zy_nBiJ166M' 
});
const getResources = (tag, nextCursor) => new Promise((resolve, reject) => {
  let params = {resource_type: 'image', max_results: 500}
  if (nextCursor) params.next_cursor = nextCursor
  cloudinary.api.resources_by_tag(tag, (result) => {
    if (!result.resources) return reject(result)
    resolve(result)
  }, params)
})

const download = (uri, filename) => new Promise((resolve, reject) => {
  filename = `images/${filename}`
  request(uri).pipe(fs.createWriteStream(filename, {flags: 'w'})).on('close', resolve).on('error', reject)
})

const downloadAll = co.wrap(function * (tag, cursor = null) {
  let {
    resources,
    next_cursor: nextCursor,
    rate_limit_remaining: rateLimitRemaining,
    rate_limit_reset_at: rateLimitResetAt
  } = yield getResources(tag, cursor)
  if (rateLimitRemaining === 0) {
    let diff = moment(rateLimitResetAt).diff(moment())
    console.log('Waiting for', diff / 1000 / 60, 'minutes')
    yield Promise.delay(diff)
  }

  yield Promise.map(resources, (resource) => {
    let filename = resource.public_id.replace(/\//g, '_') + `.${resource.format}`
    console.log('Downloading', filename)
    return download(resource.url, filename)
  }, {concurrency: 10})

  if (nextCursor) {
    yield fs.writeFileAsync('next-cursor', nextCursor)
    console.log('downloading next cursor', nextCursor)
    yield downloadAll(tag, nextCursor)
  }
})

co(function * () {
  let cursor = null
  try {
    cursor = yield fs.readFileAsync('next-cursor', 'utf-8')
    console.log('got cursor from file', cursor)
  } catch (e) {
    console.log('no cursor file found')
  }
  yield downloadAll('', cursor)
  process.exit(0)
}).catch((e) => console.error(e.stack))