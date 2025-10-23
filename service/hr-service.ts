import { IEmailService } from "@/email/interface/email-service";
import { getEmailBody } from "@/lib/constants";
import { HrDTO, IHrRepo } from "@/repository/interfaces/hr-repo";
import { IOrgRepo } from "@/repository/interfaces/org-repo";
import bcrypt from "bcryptjs";

export class HrService {
    constructor(
        private hrRepo: IHrRepo,
        private orgRepo: IOrgRepo,
        private emailService: IEmailService
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

        const existingUsername = await this.hrRepo.findByUsername(payload.username);
        if (existingUsername) {
            return { success: false, message: 'username is already taken' };
        }

        const existingEmail = await this.hrRepo.findByEmail(payload.email);
        if (existingEmail) {
            return { success: false, message: 'email is already taken' };
        }

        const hashedPassword = await bcrypt.hash(payload.password, 12);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        const org = await this.orgRepo.create({
            name: payload.org
        });

        const hrData: HrDTO = {
            username: payload.username,
            email: payload.email,
            password: hashedPassword,
            name: payload.name,
            orgId: org._id,
            otpCode,
            otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
        };

        const hr = await this.hrRepo.create(hrData);

        await this.orgRepo.updateCreatedBy(org._id, hr._id);

        const emailBody = getEmailBody(otpCode);

        const result = await this.emailService.sendOTP({
            to: payload.email,
            subject: 'Email Verification - AlertSync',
            body: emailBody
        });

        if (!result.success) {
            return { success: false, message: 'Account Created. Login for email verification' };
        }

        return { success: true, message: 'HR created successfully. Please verify your email.' };
    }
}
