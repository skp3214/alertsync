import { IHr } from "@/databases/mongo-db/models/hr.model";
import { HrDTO, IHrRepo } from "../interfaces/hr-repo";
import { dbClient } from "@/databases/db";

export class HrRepositoryMongo implements IHrRepo {
    async findByUsernameOrEmail(identifier: string): Promise<IHr | null> {
        const hr = await dbClient.HrModel.findOne({
            $or: [
                { username: identifier },
                { email: identifier }
            ]
        });
        return hr ? hr.toObject() : null;
    }

    async create(data: HrDTO): Promise<IHr> {
        const hr = await dbClient.HrModel.create(data);
        return hr.toObject();
    }

    async findByUsername(username: string): Promise<IHr | null> {
        const hr = await dbClient.HrModel.findOne({ username });
        return hr ? hr.toObject() : null;
    }

    async findByEmail(email: string): Promise<IHr | null> {
        const hr = await dbClient.HrModel.findOne({ email });
        return hr ? hr.toObject() : null;
    }

    async deleteById(id: string): Promise<boolean> {
        const result = await dbClient.HrModel.deleteOne({ _id: id });
        return result.deletedCount === 1;
    }
}

