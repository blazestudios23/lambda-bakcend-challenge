import fetch from 'node-fetch'

import AbortController from 'abort-controller'
import { Response, ErrorResponse } from './types'

export interface DogResponse extends Response {
  body: {
    message: string[]
    status: string
  }
}

export interface DogAPI {
  message: { [key: string]: string[] }
  status: string
}

const DOG_BREEDS_ENDPOINT = 'https://dog.ceo/api/breeds/'

export async function handler(): Promise<DogResponse | ErrorResponse> {
  const controller = new AbortController()
  const { signal } = controller
  signal.addEventListener('abort', () => {
    console.log('aborted!')
  })

  signal.addEventListener('onabort', () => {
    console.log('aborted dang it!')
  })

  const timeout = setTimeout(() => {
    controller.abort()
  }, 150)

  try {
    const res = await fetch(`${DOG_BREEDS_ENDPOINT}list/all`, { signal })

    if (signal.onabort) {
      throw new Error('timeout')
    }

    console.log('anything in signal', signal)
    if (!res) {
      throw new Error('No data returned!')
    }
    const payload: DogAPI = await res.json()

    const dogs = payload.message
    const keys = Object.keys(dogs)
    const message = keys.reduce((arr: string[], key) => {
      if (dogs[key].length) {
        const dogSubBreedList = dogs[key].map((dog) => `${dog} ${key}`)
        return [...arr, ...dogSubBreedList]
      }
      return [...arr, key]
    }, [])
    return {
      statusCode: 200,
      body: { ...payload, message },
    }
  } catch (error: any) {
    console.log('signal: ', signal)
    console.log('error: ', error)

    if (signal.aborted) {
      console.log('Operation tifmed out')
    }
    // implementing error handling but get an error that AbortError doesn't exist in node fetch
    // if (error instanceof AbortError) {
    //   return {
    //     statusCode: 504,
    //     message: 'Time out error',
    //   }
    // }
    return {
      statusCode: 500,
      message: 'Something went wrong',
    }
  } finally {
    clearTimeout(timeout)
  }
}
