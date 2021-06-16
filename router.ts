import { Controller } from './controllers'

export default class Router {
	private routers = {}

	public route(type: string, data: {[k: string]: any}) {
		if (type in this.routers) {
			return this.routers[type](data)
		}

		throw new Error("Route doesn't exist")
	}

	public getRoutes() {
		return Object.keys(this.routers)
	}

	public registerAll(controllers: {[type: string]: Controller}) {
		for (const type in controllers) {
			this.register(type, controllers[type])
		}
	}

	private register(name: string, controller: Controller) {
		this.routers[name] = controller
	}
}