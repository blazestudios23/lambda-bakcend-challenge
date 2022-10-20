import fetch from 'node-fetch'

import { Response, ErrorResponse } from './types'

const { AbortController } = globalThis

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
  const timeout = setTimeout(() => {
    controller.abort()
  }, 150)
  try {
    const res = await fetch(`${DOG_BREEDS_ENDPOINT}list/all`, { signal: controller.signal })
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
  } catch (error: unknown) {
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
