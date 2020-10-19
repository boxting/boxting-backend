import { config } from "dotenv";
import { Sequelize } from "sequelize-typescript";

export class MySequelize{

    private static _instance: MySequelize
    conn: Sequelize

    constructor(){
        config()
        try {
            this.conn = new Sequelize({
                sync: { force:true },
                database: process.env.DATABASE_NAME,
                username: process.env.DATABASE_USERNAME,
                password: process.env.DATABASE_PASSWORD,
                dialect: "mysql",
                port: Number(process.env.DATABASE_PORT) || 3306,
                define: {
                    underscored: true
                }
            })
            this.conn.addModels([])
            console.log("Database connected")
        } catch (error) {
            console.log('Something went wrong trying to connect with database')
            throw error
        }   
    }

    public static getConnection() {
        return this._instance || (this._instance = new this())
    }
}