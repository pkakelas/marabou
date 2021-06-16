import * as stringify from 'canonical-json'
import errors from "./errors"
import Router from './router'
import { Socket, createServer } from "net" 
import { JSONBuffParse } from "./utils"

const MAX_BUFFER_SIZE = 1000
const PORT = 8080

export class Server {
	private router: Router

	constructor(router: Router) {
		this.router = router

		const server = createServer()
		server.listen(PORT)

		console.log('[SERVER] Starting TCP server')

		server.on('connection', (socket: Socket) => {
			let bufferCache: Buffer  = Buffer.alloc(0)

			socket.on('data', (newBuff: Buffer) => 
				this.handleNewData(socket, bufferCache, newBuff))
		}) 
	}

	private handleNewData(socket: Socket, bufferCache: Buffer, newBuff: Buffer): void {
		const client = this.getClientAddr(socket)
		console.log(`[SERVER] New message from client: ${client}`, String(newBuff))

		const buff = Buffer.concat([bufferCache, newBuff])
		const req = JSONBuffParse(buff)

		if (!req) {
			bufferCache = buff
			return
		}
		if (this.bufferExceededLimit(bufferCache)) {
			console.log(`Buffer of client ${client} exceeded buffer size`)
			socket.destroy()
			return
		}
		if (!this.hasValidType(req)) {
			this.emitError(socket, new errors.InvalidTypeError())
			return
		}

		try {
			this.emit(socket, this.handleRequest(req))
		}
		catch (e) {
			console.log("[SERVER] Error during req handling", e.message, client, req)

			if (e instanceof errors.NetError) {
				e.shouldDisclose && this.emitError(socket, e)
				e.shouldDisconnect && socket.destroy()
			}
		}
	}

	private handleRequest(req: Object) {
		return this.router.route(req['type'], req)
	}

	private hasValidType(req: Object) {
		const routes = this.router.getRoutes()

		return Object.keys(req).includes('type') &&
			   routes.includes(req['type'])
	}

	private emitError(socket, e: Error) {
		const ret = {
			'type': 'error',
			'message': e.message
		}

		socket.write(stringify(ret))
	}
	
	private emit(socket: Socket, msg: Object) {
		socket.write(stringify(msg) + '\n')
	}
	
	private bufferExceededLimit(buff: Buffer): boolean {
		return Buffer.byteLength(buff) > MAX_BUFFER_SIZE
	}

	private getClientAddr(socket: Socket) {
		return `${socket.remoteAddress}:${socket.remotePort}`
	}
}