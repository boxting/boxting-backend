import { Role } from "../model/role.model";

export async function createInitialData() {
    try {
        await Role.bulkCreate([
            {
                name: "ADMIN",
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                name: "VOTER",
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                name: "ORGANIZER",
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                name: "COLLABORATOR",
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        ])
    } catch (error) {
        throw error
    }

}