import axios, { AxiosResponse } from "axios"
import { Result } from "../../../interface/result.interface"
import { InitTransaction } from "../interface/transaction/init.transaction.interface"

export class ContractManager {

    private static _instance: ContractManager

    constructor() {
        console.info('Contract manager instance created')
    }

    public static getInstace() {
        return this._instance || (this._instance = new this())
    }

    async initEvent(contractUrl: string, initData: InitTransaction): Promise<Result> {
        try {
            const res: AxiosResponse<Result> = await axios.post(`${contractUrl}/event/init`, initData)

            return Promise.resolve(res.data)
        } catch (error) {

            if (error.error) {
                console.log('error error', error.error)
                return Promise.reject(error.error)
            }

            return Promise.reject(error)
        }
    }
}