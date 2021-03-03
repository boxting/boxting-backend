import axios, { AxiosResponse } from "axios"
import { Result } from "../../../interface/result.interface"
import { EmitVoteTransaction } from "../interface/transaction/emit.vote.interface"
import { InitTransaction } from "../interface/transaction/init.transaction.interface"
import { ReadVoteTransaction } from "../interface/transaction/read.vote.interface"

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

    async getElectionResults(contractUrl: string, electionId: string): Promise<Result> {
        try {
            const res: AxiosResponse<Result> = await axios.get(`${contractUrl}/election/${electionId}`)

            return Promise.resolve(res.data)
        } catch (error) {

            if (error.error) {
                console.log('error error', error.error)
                return Promise.reject(error.error)
            }

            return Promise.reject(error)
        }
    }

    async emitVote(contractUrl: string, voteData: EmitVoteTransaction): Promise<Result> {
        try {
            const res: AxiosResponse<Result> = await axios.post(`${contractUrl}/vote/emit`, voteData)

            return Promise.resolve(res.data)
        } catch (error) {

            if (error.error) {
                console.log('error error', error.error)
                return Promise.reject(error.error)
            }

            return Promise.reject(error)
        }
    }

    async readVote(contractUrl: string, voteData: ReadVoteTransaction): Promise<Result> {
        try {
            const res: AxiosResponse<Result> = await axios.post(`${contractUrl}/vote/get`, voteData)

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