import { IOrganization } from "@/databases/mongo-db/models/org.model";
import { OrgDTO, IOrgRepo } from "../interfaces/org-repo";
import { dbClient } from "@/databases/db";
import { Types } from "mongoose";

export class OrgRepositoryMongo implements IOrgRepo {

    async create(data: OrgDTO): Promise<IOrganization> {
        const org = await dbClient.OrganizationModel.create(data);
        return org.toObject();
    }

    async updateCreatedBy(orgId: Types.ObjectId, hrId: Types.ObjectId): Promise<void> {
        await dbClient.OrganizationModel.updateOne({ _id: orgId }, { createdBy: hrId });
    }
}
