import { config } from "dotenv";
import { Sequelize } from "sequelize-typescript";
import { createInitialData } from "./create.initial"
import { AccessCode } from "../model/access.code.model";
import { Election } from "../model/election.model";
import { Event } from "../model/event.model";
import { Organizer } from "../model/organizer.model";
import { Role } from "../model/role.model";
import { UserEvent } from "../model/user.event.model";
import { User } from "../model/user.model";
import { Voter } from "../model/voter.model";
import { Type } from "../model/type.model";
import { List } from "../model/list.model";
import { Candidate } from "../model/candidate.model";
import { PasswordToken } from "../model/password.token.model";
import { RefreshToken } from "../model/refresh.token.model";

export class MySequelize {

    private static _instance: MySequelize
    conn: Sequelize

    constructor() {
        config()
        try {

            this.conn = new Sequelize({
                logging: false,
                host: process.env.DATABASE_HOST,
                database: process.env.DATABASE_NAME,
                username: process.env.DATABASE_USERNAME,
                password: process.env.DATABASE_PASSWORD,
                dialect: "mysql",
                port: Number(process.env.DATABASE_PORT) || 3306,
                define: {
                    underscored: true
                },
            })
            this.conn.addModels([
                Role, User, Voter, Organizer, Event, UserEvent, AccessCode,
                Election, Type, List, Candidate, PasswordToken, RefreshToken
            ])

            if (process.env.RUN_CREATION && process.env.RUN_CREATION == "true") {
                this.syncDatabase()
            }

            console.log("Database connected")
        } catch (error) {
            console.log('Something went wrong trying to connect with database')
            throw error
        }
    }

    private async syncDatabase() {

        createInitialData()
            .then(() => console.log('Initial data creation completed'))
            .catch((error) => {
            console.log('Something went wrong trying to create initial data', error)
        })
    }

    public static getConnection() {
        return this._instance || (this._instance = new this())
    }
}