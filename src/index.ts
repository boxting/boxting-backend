import { App } from "./app"
import "reflect-metadata"

async function main() {
    const app = new App()
    await app.listen()
}

main()