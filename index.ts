import { controllers } from "./controllers"
import Router from './router'
import { Server } from "./network"

const main = () => {
	const router = new Router()
	router.registerAll(controllers)

	const s = new Server(router)
}

main()
