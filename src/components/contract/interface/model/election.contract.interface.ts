export interface ElectionContract {
    id: string
    eventId: string
    electionType: 'single' | 'multiple'
    maxVotes: number
}