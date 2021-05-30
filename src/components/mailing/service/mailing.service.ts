import fs from 'fs'
import handlebars from 'handlebars'
import * as mailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import * as path from 'path';
import { InternalError } from '../../../error/base.error';
import { config } from 'dotenv';

export class MailingService {

    private static _instance: MailingService

    transporter: Mail

    constructor() {

        // Call config to read env variables
        config()

        try {
            this.transporter = mailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD
                }
            })

            console.log('Mailing server connected')
        } catch (error) {
            console.log('Something went wrong trying to connect with SMTP server')
            throw error
        }
    }

    async sendRecoverPasswordMail(userMail: string, newToken: string, username: string) {

        try {
            //Read and set html to send
            const hostMail = process.env.HOST_MAIL

            const filePath = path.join(__dirname, '../template/recover.password.html');

            const source = fs.readFileSync(filePath, 'utf-8').toString();

            const template = handlebars.compile(source);

            let replacements = {
                username: username,
                newToken: newToken
            };

            let htmlToSend = template(replacements);

            let mailOptions: Mail.Options = {
                from: `Soporte de Boxting <${hostMail}>`,
                to: userMail,
                subject: 'Recupera tu contraseña',
                html: htmlToSend
            }

            let info = await this.transporter.sendMail(mailOptions)

            return Promise.resolve(info)
        } catch (error) {
            return Promise.reject(new InternalError(500, error))
        }
    }

    public static getConnection() {
        return this._instance || (this._instance = new this())
    }
}