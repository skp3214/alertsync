import { Types } from "mongoose";
import { IHr } from "@/databases/mongo-db/models/hr.model";

export type HrDTO={
    username:string,
    email:string,
    password:string,
    name:string,
    orgId:Types.ObjectId, 
    otpCode?:string
    otpExpiresAt?:Date
}

export interface IHrRepo{
    create(data:HrDTO):Promise<IHr>;
    findByUsername(username: string): Promise<IHr | null>;
    findByEmail(email: string): Promise<IHr | null>;
    findByUsernameOrEmail(identifier:string):Promise<IHr|null>;
    deleteById(id:string):Promise<boolean>;
}
