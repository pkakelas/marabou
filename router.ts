import { Controller, controllers } from './controllers'
import { InvalidTypeError } from './errors'

export default class Router {
	private routes = {}

	constructor() {
		this.registerAll(controllers)
	}

	public route(type: string, data: {[k: string]: any}) {
		console.log("[ROUTER] Routing request", type, data)

		if (type in this.routes) {
			return this.routes[type](data)
		}

		throw new InvalidTypeError()
	}

	public registerAll(controllers: {[type: string]: Controller}) {
		for (const type in controllers) {
			this.register(type, controllers[type])
		}
	}

	private register(name: string, controller: Controller) {
		this.routes[name] = controller
	}
}
