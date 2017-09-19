export default class HttpError extends Error {
  constructor ({ statusCode, body, headers } = {}) {
    super(body)
    this.body = body
    this.headers = headers
    this.name = 'HttpError'
    this.statusCode = statusCode
  }
}
