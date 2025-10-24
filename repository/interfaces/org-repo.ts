import { Types } from "mongoose";
import { IOrganization } from "@/databases/mongo-db/models/org.model";

export type OrgDTO = {
    name: string;
    createdBy?: Types.ObjectId;
}

export interface IOrgRepo {
    create(data: OrgDTO): Promise<IOrganization>;
    updateCreatedBy(orgId: Types.ObjectId, hrId: Types.ObjectId): Promise<void>;
    deleteById(id: string): Promise<boolean>;
}
