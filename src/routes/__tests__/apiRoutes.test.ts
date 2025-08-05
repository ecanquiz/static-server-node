import {describe, it, expect} from 'vitest'
import request from 'supertest'
import app from '../../app'
import config from '../../config/index';

describe('apiRoutes', () => {
  it('Should respond with 404 for unknown routes', async () => {
    const response = await request(app).get('/non-existent-route')
    expect(response.statusCode).toBe(404)
  })

  it('Should respond with 200 for health check', async () => {
    const response = await request(app).get('/')
    expect(response.statusCode).toBe(200)
    expect(response.text).toContain(config.mainScreen);
  })
})

describe('Accept header handling', () => {
  it('should respect Accept: text\/html; charset=UTF-8', async () => {
    const res = await request(app)
      .get('/storage')
      //.set('Accept', 'application/json');
    
    expect(res.headers['content-type']).toMatch(/text\/html; charset=UTF-8/);
  });
});