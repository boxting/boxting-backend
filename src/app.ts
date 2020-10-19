import Express, { Application } from "express";
import { config as EnvConfig } from "dotenv"
import Morgan from "morgan"
import { json } from "body-parser"

export class App{

    private app: Application

    constructor(private port?:number|string){
        EnvConfig()
        this.app = Express()
        this.settings()
        this.middlewares()
        this.routes()
    }

    settings(){
        this.app.set('port', this.port || process.env.PORT || 3000)
    }

    middlewares(){
        this.app.use(Morgan('dev'))
    }

    routes(){
        this.app.get('/', json(), function (req, res) {
            res.send('Hello World!')
        })
    }

    async listen(){
        this.app.listen(this.app.get('port'))
        console.log("App listening to port", this.app.get('port'))
    }

}