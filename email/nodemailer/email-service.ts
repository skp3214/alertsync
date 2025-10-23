import nodemailer from "nodemailer"
import { EmailPayload, IEmailService } from "../interface/email-service";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

export class NodeMailerService implements IEmailService {

    async sendOTP(payload: EmailPayload): Promise<{ success: boolean; message?: string; }> {
        try {
            await transporter.verify();

            const info = await transporter.sendMail({
                from: `"AlertSync" <${process.env.EMAIL_USER}>`,
                to: payload.to as string,
                subject: payload.subject,
                html: payload.body
            });

            if (info.messageId) {
                return { success: true, message: 'Email Sent Successfully' };
            } else {
                return { success: false, message: "Email sent but no messageId received." };
            }

        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }
}
