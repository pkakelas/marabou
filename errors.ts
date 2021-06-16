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

export class IncopatibilityError extends NetError {
	disconnect = true
	message = "Incopatible Clients"
}
export class InvalidDataError extends NetError {
	disconnect = true
	message = "Provided Invalid Data"
}

const errors = { 
	NetError,
	InvalidTypeError,
	IncopatibilityError,
	InvalidDataError
}

export default errors