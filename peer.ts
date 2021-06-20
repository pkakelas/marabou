import { Socket, connect } from "net" 
import * as stringify from 'canonical-json'
import Router from "./router"
import errors, { InvalidDataError } from "./errors"
import { ParsedSocketMessage } from "./types"
import { parseNewMessage } from "./utils"

export default class Peer {
	private host: string
	private port: number
	private socket: Socket 
	private cache: Buffer = Buffer.alloc(0)
	private router: Router = new Router()

	constructor(host: string, port: number, socket?: Socket) {
		this.host = host
		this.port = port

		this.socket = socket || connect(this.port, this.host)
		this.socket.on('data', b => this.handleNewData(b))
	}

	private handleNewData(buffer: Buffer): void {
		let parsed: ParsedSocketMessage
		console.log(`[SERVER] New message from client: ${this.getClientAddr()}`, buffer.toString())

		try {
			parsed = parseNewMessage(this.cache, buffer)
			if (!parsed) {
				throw new InvalidDataError()
			}

			for (const req of parsed.reqs) {
				const res =  this.router.route(req['type'], req)
				this.emit(res)
			}

		}
		catch (e) {
			this.handleNetworkError(e)
		}
	}

	private getClientAddr() {
		return `${this.socket.remoteAddress}:${this.socket.remotePort}`
	}

	private handleNetworkError(e: Error, aux?: any): void {
		console.log("[SERVER] Error", e.message, aux)

		if (e instanceof errors.NetError) {
			e.shouldDisclose && this.emitError(e)
			e.shouldDisconnect && this.socket.destroy()
		}
	}

	private emit(msg: object) {
		this.socket.write(stringify(msg) + '\n')
	}

	private emitError(e: Error) {
		const ret = {
			'type': 'error',
			'message': e.message
		}

		this.socket.write(stringify(ret) + '\n')
	}
}