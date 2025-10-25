import { NextRequest, NextResponse } from 'next/server';
import { initDB } from '@/databases/db';
import { HrService } from '@/service/hr-service';
import { HrRepositoryMongo } from '@/repository/mongo-db/hr-repo';
import { NodeMailerService } from '@/email/nodemailer/email-service';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        await initDB();
        const { identifier, password } = await request.json();

        const hrService = new HrService(new HrRepositoryMongo());
        const emailService = new NodeMailerService();

        const user = await hrService.checkUsernameOrEmail(identifier);

        if (!user) {
            return NextResponse.json({
                success: false,
                message: `No user found with this ${identifier}`
            }, { status: 400 });
        }

        if (!user.emailVerified) {
            if (user.otpExpiresAt && user.otpExpiresAt > new Date()) {
                return NextResponse.json({
                    success: false,
                    username: user.username,
                    message: "OTP is not expired. Please verify your email."
                }, { status: 400 });
            } else {
                const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                const result = await hrService.updateOtpDetails(
                    user._id,
                    newOtp,
                    new Date(Date.now() + 10 * 60 * 1000)
                );
                const emailBody = `Your OTP code is: ${newOtp}. It will expire in 10 minutes.`;
                if (result) {
                    await emailService.sendOTP({
                        to: user.email,
                        subject: 'Your New OTP Code - AlertSync',
                        body: emailBody
                    });
                }
                return NextResponse.json({
                    success: false,
                    username: user.username,
                    message: "New OTP sent. Please verify your email."
                }, { status: 400 });
            }
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return NextResponse.json({
                success: false,
                message: "Invalid Password"
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: "Validation successful"
        });

    } catch (error) {
        console.error('Validation error:', error);
        return NextResponse.json({
            success: false,
            message: "Validation failed due to server error"
        }, { status: 500 });
    }
}
