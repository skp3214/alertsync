import dbConnectMongo from "./mongo-db/db-connect-mongo";
import { HrModel } from "./mongo-db/models/hr.model";
import { OrganizationModel } from "./mongo-db/models/org.model";

const DB = process.env.DB_PROVIDER || 'mongo';

export const dbClient: any = {}

export async function initDB() {

    if (DB === 'mongo') {

        await dbConnectMongo();

        dbClient.HrModel = HrModel;
        dbClient.OrganizationModel = OrganizationModel;

    } else {
        throw new Error('❌ Unsupported database provider');
    }

}
