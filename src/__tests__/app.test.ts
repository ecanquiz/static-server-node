import {describe, it, expect} from 'vitest'
import request from 'supertest'
import app from '../app'

describe('Express App', () => {
  it('should respond with 404 for unknown routes', async () => {
    const response = await request(app).get('/non-existent-route')
    expect(response.statusCode).toBe(404)
  })

  it('should respond with 200 for health check', async () => {
    const response = await request(app).get('/')
    expect(response.statusCode).toBe(200)
    expect(response.text).toContain('Static server with Node.js')
  })
})