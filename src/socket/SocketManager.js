import ProductSocket from './ProductSocket.js';
import MessageSocket from './MessageSocket.js';

export default class SocketManager {
    constructor(io, productManager, messageManager) {
        this.productSocket = new ProductSocket(io, productManager);
        this.messageSocket = new MessageSocket(io, messageManager);
        this.initializeSockets(io);
    }


    initializeSockets(io) {
        io.on("connection", async (socket) => {
            console.log(`Client connected with ID: ${socket.id}`);

            await this.productSocket.registerEvents(socket);
            await this.messageSocket.registerEvents(socket);

            socket.on('disconnect', () => {
                console.log(`Client with ID: ${socket.id} disconnected.`);
            });
        });
    }
}