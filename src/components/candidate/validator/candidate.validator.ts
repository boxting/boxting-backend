import { InternalError } from "../../../error/base.error"
import { NotFoundError } from "../../../error/not.found.error"
import { Candidate } from "../model/candidate.model"

export class CandidateValidator {

    public static async checkIfExistOnElection(candidateId: number, electionId: number) {
        try {
            // Find candidate with specified candidatename
            const candidate: Candidate | null = await Candidate.findOne({
                where: { id: candidateId, electionId: electionId }
            })

            // Check if an candidate was found
            if (candidate == null) {
                return Promise.reject(new NotFoundError(8001, 'No candidate found with provided id'))
            }

            return Promise.resolve(candidate)
        } catch (error) {

            return Promise.reject(new InternalError(500, error))
        }
    }
}