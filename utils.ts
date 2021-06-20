import errors from './errors'
import { ParsedSocketMessage } from './types'

const MAX_BUFFER_SIZE = 1e6

export const parseNewMessage = (bufferCache: Buffer, newBuff: Buffer): ParsedSocketMessage => {
	const buffer = Buffer.concat([bufferCache, newBuff])

	if (Buffer.byteLength(buffer) > MAX_BUFFER_SIZE) {
		throw new errors.BufferExceededError()
	}

	const reqs = []
	const messages = buffer.toString().split('\n')
	for (const [idx, message] of Object.entries(messages)) {
		const req = JSONParse(message)

		if (!req) {
			// Potential TCP fragmentation
			if (+idx == messages.length - 1) {
				return {reqs, cache: Buffer.from(message)}
			}

			throw new errors.InvalidDataError()
		}

		reqs.push(req)
	}

	return {reqs, cache: Buffer.from('')}
}

export const JSONParse = (str: string): object => {
	try {
		return JSON.parse(str)
	} catch (e) {
		return undefined
	}
}
