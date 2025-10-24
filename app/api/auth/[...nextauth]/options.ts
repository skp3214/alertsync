import { dbClient, initDB } from "@/databases/db";
import { NodeMailerService } from "@/email/nodemailer/email-service";
import { HrRepositoryMongo } from "@/repository/mongo-db/hr-repo";
import { HrService } from "@/service/hr-service";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                identifier: { label: "Email/Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await initDB();
                const hrService = new HrService(new HrRepositoryMongo());
                const emailService = new NodeMailerService();

                try {
                    const user = await hrService.checkUsernameOrEmail(credentials.identifier);

                    if (!user) {
                        throw new Error(`No user found with this ${credentials.identifier}`);
                    }
                    
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordCorrect) {
                        throw new Error('Invalid Password');
                    }

                    if (!user.emailVerified && user.otpExpiresAt && user.otpExpiresAt < new Date()) {
                        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                        await dbClient.HrModel.updateOne(
                            { _id: user._id },
                            { otpCode: newOtp, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) }
                        );
                        const emailBody = `Your OTP code is: ${newOtp}. It will expire in 10 minutes.`;
                        await emailService.sendOTP({
                            to: user.email,
                            subject: 'Your New OTP Code - AlertSync',
                            body: emailBody
                        });
                        throw new Error('OTP has expired. A new OTP has been sent to your email.');
                    }

                    if (!user.emailVerified) {
                        throw new Error('Please verify your email to proceed. Enter the OTP sent to your email.');
                    }


                    return user;
                } catch (error) {
                    console.error('Authorization failed:', error);
                    return error;
                }
            }
        })
    ],

    pages: {
        signIn: '/sign-in',
    },

    session: {
        strategy: "jwt"
    },

    secret: process.env.NEXT_AUTH_SECRET,

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.emailVerified = user.emailVerified as boolean;
                token.username = user.username;
                token.email = user.email;
                token.name = user.name;
            }
            return token
        },

        async session({ session, token }) {
            if (token) {
                session.user._id = token._id
                session.user.emailVerified = token.emailVerified
                session.user.username = token.username
                session.user.email = token.email
                session.user.name = token.name
            }
            return session
        },
    }
}