import Express, { Application } from "express";
import { config as EnvConfig } from "dotenv"
import Morgan from "morgan"
import Cors from "cors"
import { json } from "body-parser"
import { MySequelize } from "./database/sequelize";
import { handleError } from "./middleware/error.middleware";
import { users } from "./api/user.api"

export class App{

    private app: Application
    private sequelize: MySequelize

    constructor(private port?:number|string){
        EnvConfig()
        this.app = Express()
        this.sequelize = new MySequelize()
        this.settings()
        this.middlewares()
        this.routes()
    }

    settings(){
        this.app.set('port', this.port || process.env.PORT || 3000)
    }

    middlewares(){
        this.app.use(Morgan('dev'))
        this.app.use(Cors())
    }

    routes(){
        this.app.get('/', json(), function (req, res) {
            res.send('Hello World!')
        })

        this.app.use('/user', json(), users)

        this.app.use(handleError)
    }

    async listen(){
        await this.sequelize.conn.sync()
        this.app.listen(this.app.get('port'))
        console.log("App listening to port", this.app.get('port'))
    }

}