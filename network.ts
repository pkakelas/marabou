import * as stringify from 'canonical-json'
import errors from "./errors"
import Router from './router'
import { Socket, createServer } from "net" 
import { JSONParse } from "./utils"

const MAX_BUFFER_SIZE = 1e6
const PORT = 8080

export class Server {
	private router: Router

	constructor(router: Router) {
		this.router = router

		const server = createServer()
		server.listen(PORT)

		console.log('[SERVER] Starting TCP server')

		server.on('connection', (socket: Socket) => {
			let cache: Buffer  = Buffer.alloc(0)

			socket.on('data', (buffer: Buffer) => {
                cache = this.handleNewData(socket, cache, buffer)
            })
		})
	}

	private handleNewData(socket: Socket, bufferCache: Buffer, newBuff: Buffer): Buffer {
		const client = this.getClientAddr(socket)
		const buffer = Buffer.concat([bufferCache, newBuff])
		console.log(`[SERVER] New message from client: ${client}`, newBuff.toString())

        if (this.bufferExceededLimit(buffer)) {
            console.log(`Buffer of client ${client} exceeded buffer size`)
            socket.destroy()
        }

        const messages = buffer.toString().split('\n')
		for (const [idx, message] of Object.entries(messages)) {
			const req = JSONParse(message)

			if (!req) {
				// Potential TCP fragmentation
				if (+idx == messages.length - 1) {
					return Buffer.from(message)
				}

				this.emitError(socket, new errors.InvalidDataError())
				socket.destroy()
				return
			}

			const res = this.handleRequest(socket, req)
			this.emit(socket, res)
		}
	}

	private handleRequest(socket: Socket, req: Object) {
		if (!this.hasValidType(req)) {
			this.emitError(socket, new errors.InvalidTypeError())
			return
		}

		try {
			const res = this.router.route(req['type'], req)
			return { type: req['type'], ...res }
		}
		catch (e) {
			console.log("[SERVER] Error during req handling", e.message, req)

			if (e instanceof errors.NetError) {
				e.shouldDisclose && this.emitError(socket, e)
				e.shouldDisconnect && socket.destroy()
			}
		}
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

		socket.write(stringify(ret) + '\n')
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
