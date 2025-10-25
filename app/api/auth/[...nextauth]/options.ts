import { initDB } from "@/databases/db";
import { IHr } from "@/databases/mongo-db/models/hr.model";
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

                try {
                    const user = await hrService.checkUsernameOrEmail(credentials.identifier) as IHr;

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordCorrect) {
                        throw new Error('Invalid Password');
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