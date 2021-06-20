import { Socket, createServer } from "net" 
import Peer from './peer'

const PORT = 8080

export class Server {
	constructor() {
		const server = createServer()
		server.listen(PORT)

		console.log('[SERVER] Starting TCP server')

		server.on('connection', (socket: Socket) => {
			new Peer(socket.remoteAddress, socket.remotePort, socket)
		})
	}
}
