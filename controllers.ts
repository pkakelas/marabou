import { IncompatibilityError, InvalidDataError  } from "./errors"

const VERSION = "0.2.0"

export type Controller = (obj: {[k: string]: any}) => Object 

const hello: Controller = ({version}) => {
	if (!version) {
		throw new InvalidDataError()
	}

	if (version.slice(0, 3) != VERSION.slice(0, 3)) {
		throw new IncompatibilityError()
	}

	return {
		"type": "hello",
		"version": VERSION,
		"agent": "Mitsoz Client"
	}
} 

const peers: Controller = (_) => {
	const peers = ["keftes.di.uoa.gr:18018"]
	return {

	}
}

export const controllers = {
	"hello": hello
}
