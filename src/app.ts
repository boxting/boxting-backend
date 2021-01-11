// Database
import { MySequelize } from "./database/sequelize";
// Middleware
import { handleError } from "./middleware/error.middleware";
// Admin Api
import { adminUserApi } from "./api/admin/admin.user.api";
import { adminEventApi } from "./api/admin/admin.event.api";
// User Api
import { accessCodeApi } from "./api/user/access.code.api";
import { userApi } from "./api/user/user.api";
import { eventApi } from "./api/user/event.api";
import { loginApi } from "./api/user/login.api";
// Packages
import Express, { Application } from "express";
import { config as EnvConfig } from "dotenv"
import Morgan from "morgan"
import Cors from "cors"
import { json } from "body-parser"

export class App {

    private app: Application
    private sequelize: MySequelize

    constructor(private port?: number | string) {
        EnvConfig()
        this.app = Express()
        this.sequelize = new MySequelize()
        this.settings()
        this.middlewares()
        this.routes()
    }

    settings() {
        this.app.set('port', this.port || process.env.PORT || 3000)
    }

    middlewares() {
        this.app.use(Morgan('dev'))
        this.app.use(Cors())
    }

    routes() {
        this.app.get('/', json(), function (req, res) {
            res.send('Hello World!')
        })

        // Admin routers
        this.app.use('/admin/user', json(), adminUserApi)
        this.app.use('/admin/event', json(), adminEventApi)

        // User routers
        this.app.use('/login', json(), loginApi)
        this.app.use('/user', json(), userApi)
        this.app.use('/event', json(), eventApi)
        this.app.use('/code', json(), accessCodeApi)

        this.app.use(handleError)
    }

    async listen() {
        await this.sequelize.conn.sync()
        this.app.listen(this.app.get('port'))
        console.log("App listening to port", this.app.get('port'))
    }

}