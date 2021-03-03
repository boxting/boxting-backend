export interface CandidateContract {
    id: string
    electionId: string
    firstName: string
    lastName: string
    imageUrl: string
    voteCount?: number
}