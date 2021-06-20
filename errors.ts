class NetError extends Error {
	protected disconnect = false
	protected disclose = true

	constructor(message ?: string) {
		super(message)
		Object.setPrototypeOf(this, new.target.prototype)
	}

	shouldDisconnect() {
		return this.disconnect
	}

	shouldDisclose() {
		return this.disclose
	}
}

export class InvalidTypeError extends NetError {
	disclose = true
	message = "Invalid type provided"
}

export class IncompatibilityError extends NetError {
	disconnect = true
	message = "Incompatible Clients"
}
export class InvalidDataError extends NetError {
	disconnect = true
	message = "Provided Invalid Data"
}
export class BufferExceededError extends NetError {
	disconnect = true
	message = "Buffer Exceeded 1mb"
}

const errors = { 
	NetError,
	InvalidTypeError,
	BufferExceededError,
	IncompatibilityError,
	InvalidDataError
}

export default errors