import {getServerSession, NextAuthOptions} from "next-auth";
import {PrismaAdapter} from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import {db} from "@/lib/db";
import {nanoid} from "nanoid";
import axios from "axios";

export const authOptions:NextAuthOptions = {
    adapter: PrismaAdapter(db),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/sign-in",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    ],
    callbacks: {
        async session({token, session}){
            if(token) {
                session.user = {
                  ...session.user,
                  id: token.id,
                  name: token.name,
                  email: token.email,
                  image: token.picture,
                  username: token.username,
                };
            }

            return session
        },

        async jwt ({token, user}) {
            const dbUser = await db.user.findFirst({
                where: {
                    email: token.email
                }
            })

            if(!dbUser) {
                token.id = user!.id
                return token
            }

            if(!dbUser.username) {
                await db.user.update({
                    where: {
                        id: dbUser.id,
                    },
                    data: {
                        username: nanoid(10)
                    }
                })
            }

            if(!dbUser.image) {
                // Fetch profile picture from Google userinfo API
                const {data} = await axios.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    {
                        headers: {
                            Authorization: `Bearer ${token.accessToken}`,
                        },
                });
                await db.user.update({
                    where: {
                        id: dbUser.id,
                    },
                    data: {
                        image: data.picture,
                    }
                })
            }

            const updatedToken = {
                  ...token,
                  id: dbUser.id,
                  name: dbUser.name,
                  email: dbUser.email,
                  image: dbUser.image || user!.image,
                  username: dbUser.username,
            };

            return updatedToken;
        },

        redirect() {
            return '/'
        }
    }
}

export const getAuthSession = () => getServerSession(authOptions)