import fetch from 'node-fetch'
import { AbortSignal } from 'abort-controller'
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

export async function handler(signal?: AbortSignal): Promise<DogResponse | ErrorResponse> {
  try {
    const res = await fetch(`${DOG_BREEDS_ENDPOINT}list/all`, { signal })
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
  } catch (err: unknown) {
    return {
      statusCode: 500,
      message: 'Something went wrong',
    }
  }
}
