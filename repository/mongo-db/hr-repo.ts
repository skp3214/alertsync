import { IHr } from "@/databases/mongo-db/models/hr.model";
import { HrDTO, IHrRepo } from "../interfaces/hr-repo";
import { dbClient } from "@/databases/db";

export class HrRepositoryMongo implements IHrRepo{

    async create(data: HrDTO): Promise<IHr> {
        const hr = await dbClient.HrModel.create(data);
        return hr.toObject();
    }

    async findByUsername(username: string): Promise<IHr | null> {
        const hr = await dbClient.HrModel.findOne({ username, emailVerified: true });
        return hr ? hr.toObject() : null;
    }

    async findByEmail(email: string): Promise<IHr | null> {
        const hr = await dbClient.HrModel.findOne({ email, emailVerified: true });
        return hr ? hr.toObject() : null;
    }
}
