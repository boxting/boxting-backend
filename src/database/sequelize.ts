import { config } from "dotenv";
import { Sequelize } from "sequelize-typescript";
import { Organizer } from "../model/organizer.model";
import { Role } from "../model/role.model";
import { User } from "../model/user.model";
import { Voter } from "../model/voter.model";

export class MySequelize{

    private static _instance: MySequelize
    conn: Sequelize

    constructor(){
        config()
        try {
            this.conn = new Sequelize({
                //sync: { force:true },
                logging: false,
                database: process.env.DATABASE_NAME,
                username: process.env.DATABASE_USERNAME,
                password: process.env.DATABASE_PASSWORD,
                dialect: "mysql",
                port: Number(process.env.DATABASE_PORT) || 3306,
                define: {
                    underscored: true
                }
            })
            this.conn.addModels([Role, User, Voter, Organizer])
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