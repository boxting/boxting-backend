import { config } from "dotenv";
import { Sequelize } from "sequelize-typescript";
import { createInitialData } from "./create.initial"
import { AccessCode } from "../components/codes/model/access.code.model";
import { Election } from "../components/election/model/election.model";
import { Event } from "../components/event/model/event.model";
import { Organizer } from "../components/user/model/organizer.model";
import { Role } from "../components/role/model/role.model";
import { UserEvent } from "../components/event/model/user.event.model";
import { User } from "../components/user/model/user.model";
import { Voter } from "../components/user/model/voter.model";
import { Type } from "../components/type/model/type.model";
import { List } from "../components/list/model/list.model";
import { Candidate } from "../components/candidate/model/candidate.model";
import { PasswordToken } from "../components/token/model/password.token.model";
import { RefreshToken } from "../components/token/model/refresh.token.model";

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