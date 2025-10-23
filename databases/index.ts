import { dbClient,initDB } from "./db";

let isDbInitialized = false

export async function getDatabase() {
    if(!isDbInitialized){
        await initDB();
        isDbInitialized=true;
    }
    return dbClient;
}