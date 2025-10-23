import dbConnectMongo from "./mongo-db/db-connect-mongo";
import { HrModel } from "./mongo-db/models/hr.model";

const DB = process.env.DB_PROVIDER || 'mongo';

export const dbClient: any = {}
export async function initDB() {
    if (DB === 'mongo') {
        await dbConnectMongo();
        dbClient.HrModel = HrModel
    } else {

    }
}