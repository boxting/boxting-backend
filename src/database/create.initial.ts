import { Role } from "../model/role.model";
import { Type } from "../model/type.model";

export async function createInitialData() {
    try {
        await Type.bulkCreate([
            {
                id: 1,
                name: "SINGLE",
                information: "Tipo de elección que solo permite la selección de un candidato por voto.",
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 2,
                name: "MULTIPLE",
                information: "Tipo de elección que permite la selección un número mayor a 1 de candidatos por voto.",
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        ])
        
        await Role.bulkCreate([
            {
                id: 1,
                name: "ADMIN",
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 2,
                name: "VOTER",
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 3,
                name: "ORGANIZER",
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 4,
                name: "COLLABORATOR",
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        ])

        
    } catch (error) {
        throw error
    }

}