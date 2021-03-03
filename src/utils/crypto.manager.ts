import crypto, { CipherKey } from 'crypto'
import { config } from 'dotenv'

export class CryptoManager {

    private static _instance: CryptoManager
    private algorithm: string
    private key: CipherKey
    private iv: string | null

    public static getInstance() {
        return this._instance || (this._instance = new this())
    }

    constructor() {
        config()

        const encryptionAlgorithm = process.env.CRYPTO_ALGORITHM
        const encryptionIv = process.env.CRYPTO_IV
        const encryptionKey = process.env.CRYPTO_KEY

        // validate missing config options
        if (!encryptionAlgorithm || !encryptionIv || !encryptionKey) {
            throw Error('CryptoManager configuration Error!')
        }

        // initialize key
        this.key = crypto.createHash('sha256').update(encryptionKey).digest('base64').substr(0, 32)
        this.iv = crypto.createHash('sha256').update(encryptionIv).digest('base64').substr(0, 16)
        this.algorithm = encryptionAlgorithm

    }

    encrypt(value: string): Promise<string> {
        try {
            // Initialize Cipher instance
            const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv)

            // Return Buffer as a binary encoded string
            let buffer = Buffer.from(value, 'utf8').toString("binary")

            // Get encrypted data from the cipher instance
            const firstPart = cipher.update(buffer, "binary", "base64")
            const finalPart = cipher.final("base64")

            // concat and return both parts
            return Promise.resolve(`${firstPart}${finalPart}`)
        } catch (error) {
            return Promise.reject(error)
        }
    }

    decrypt(value: string): Promise<string> {
        try {
            // Initialize Decipher instance
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv)

            // encodes encrypted value from base64 to hex
            const buffer = Buffer.from(value, "base64").toString("hex")

            // Get decrypted data from decipher instance
            const firstPart = decipher.update(buffer, 'hex', 'utf8')
            const finalPart = decipher.final('utf8') || ''

            // concat and return both parts
            return Promise.resolve(`${firstPart}${finalPart}`)
        } catch (error) {
            return Promise.reject(error)

        }
    }
}