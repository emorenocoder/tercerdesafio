import express from 'express';
import { config } from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { engine } from 'express-handlebars';
import { __dirname } from '../utils/utils.js';
import connectDB from './Database.js';
import rootRoutes from '../Routers/index.js';
import SocketManager from '../socket/SocketManager.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';

config();

class Server {

    constructor(productManager, messageManager) {
        this.app = express();
        this.productManager = productManager;
        this.messageManager = messageManager;
        this.configPort();
        this.connectDB();
        this.middlewares();
        this.handlebars();
        this.routes();
        this.app.use(cookieParser(process.env.COOKIE_SECRET));
        const mongoStore = MongoStore.create({
            mongoUrl: process.env.MONGODB_ATLAS,
            ttl: 120000, // tiempo de vida de la sesión en milisegundos (opcional)
        });

        this.app.use(session({
            store: mongoStore,
            secret: process.env.SESSION_SECRET,
            cookie: { maxAge: 120000 },
            resave: false,
            saveUninitialized: false,
        }));
    }

    configPort(){
        this.port = process.env.PORT || 3000;
    }

    async connectDB(){
        await connectDB();
    }

    middlewares(){
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static(__dirname + "/public"));
    }

    handlebars(){
        this.app.engine('hbs', engine({
            extname: 'hbs',
            partialsDir: __dirname + '/views/partials',
            helpers:{
                eq: (v1, v2) => v1 == v2 ,
            }
        }));
        this.app.set('views', __dirname + '/views');
        this.app.set('view engine', 'hbs');
    }

    routes(){
        this.app.use('/', rootRoutes);
    }


    start(){
        this.httpServer = this.app.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}`);
        });

        this.io = new SocketIOServer(this.httpServer);
        new SocketManager(this.io, this.productManager, this.messageManager)
    }
}

export default Server;