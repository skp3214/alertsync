import { IHr } from "@/databases/mongo-db/models/hr.model";
import { IOrganization } from "@/databases/mongo-db/models/org.model";
import { IEmailService } from "@/email/interface/email-service";
import { getEmailBody } from "@/lib/constants";
import { HrDTO, IHrRepo } from "@/repository/interfaces/hr-repo";
import { IOrgRepo } from "@/repository/interfaces/org-repo";
import bcrypt from "bcryptjs";

export class HrService {
    constructor(
        private hrRepo: IHrRepo,
        private orgRepo?: IOrgRepo,
        private emailService?: IEmailService
    ) { }

    async checkUsernameAvailability(username: string) {
        const existingUser = await this.hrRepo.findByUsername(username);
        return {
            success: existingUser ? false : true,
            message: existingUser ? 'username is already taken' : 'Username is available'
        };
    }

    async checkEmailAvailability(email: string) {
        const existingUser = await this.hrRepo.findByEmail(email);
        return {
            success: existingUser ? false : true,
            message: existingUser ? 'email is already taken' : 'Email is available'
        };
    }

    async create(payload: { username: string, email: string, password: string, name: string, org: string }) {

    let newOrg: IOrganization | null = null; 
    let newHr: IHr | null = null;

    try {
        if (!this.orgRepo) {
            return { success: false, message: 'Repositories are not configured correctly (missing deleteById)' };
        }

        const existingUsername = await this.hrRepo.findByUsernameOrEmail(payload.username);
        if (existingUsername) {
            return { success: false, message: 'username is already taken' };
        }

        const existingEmail = await this.hrRepo.findByUsernameOrEmail(payload.email);
        if (existingEmail) {
            return { success: false, message: 'email is already taken' };
        }

        const hashedPassword = await bcrypt.hash(payload.password, 12);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        newOrg = await this.orgRepo.create({
            name: payload.org
        });

        const hrData: HrDTO = {
            username: payload.username,
            email: payload.email,
            password: hashedPassword,
            name: payload.name,
            orgId: newOrg._id,
            otpCode,
            otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
        };
        newHr = await this.hrRepo.create(hrData);

        await this.orgRepo.updateCreatedBy(newOrg._id, newHr._id);

        const emailBody = getEmailBody(otpCode);
        let result = { success: false };
        if (this.emailService) {
            result = await this.emailService.sendOTP({
                to: payload.email,
                subject: 'Email Verification - AlertSync',
                body: emailBody
            });
        }

        if (!result.success) {
            throw new Error('EmailServiceError');
        }

        return { success: true, message: 'account created successfully. Please verify your email.' };

    } catch (error: any) {
    
        try {
            if (newHr) {
                await this.hrRepo.deleteById(newHr._id.toString());
            }
            if (newOrg) {
                await this.orgRepo?.deleteById(newOrg._id.toString());
            }
        } catch (rollbackError: any) {
            console.error('CRITICAL: Rollback failed:', rollbackError.message);
            return { success: false, message: 'Account creation failed. Please contact support.' };
        }

        if (error.message === 'EmailServiceError') {
            return { success: false, message: 'Account creation failed due to email service failure.' };
        }

        console.error('Account creation failed:', error.message);
        return { success: false, message: 'Account creation failed. Please try again.' };
    }
}
    async checkUsernameOrEmail(identifier: string) {
        const hr = await this.hrRepo.findByUsernameOrEmail(identifier);
        return hr;
    }
}
