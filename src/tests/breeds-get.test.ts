import fetch from 'node-fetch' // { AbortError }
import { handler } from '../lambdas/breeds-get'

const mockedFetch: jest.Mock = fetch as any

jest.mock('node-fetch')

describe('breeds-get handler', () => {
  const mockPayload = {
    message: {
      briard: [],
      buhund: ['norwegian'],
      bulldog: ['boston', 'english', 'french'],
    },
    status: 'success',
  }

  const mockResponse = {
    message: ['briard', 'norwegian buhund', 'boston bulldog', 'english bulldog', 'french bulldog'],
    status: 'success',
  }
  beforeEach(() => {
    mockedFetch.mockReturnValueOnce({
      json: () => {
        return mockPayload
      },
    })
  })

  it('returns data in correct format from fetch request', async () => {
    const response = await handler()
    expect(response).toMatchObject({ body: mockResponse })
  })
})

describe('Error responses', () => {
  const mockResponse = { message: 'Something went wrong', statusCode: 500 }

  it('returns error when request times out', async () => {
    const response = await handler()
    expect(response).toMatchObject(mockResponse)
  })

  it('returns error', async () => {
    mockedFetch.mockRejectedValue({ status: 500, error: new Error('Internal Server Error') })
    const response = await handler()
    expect(response).toMatchObject(mockResponse)
  })
})
