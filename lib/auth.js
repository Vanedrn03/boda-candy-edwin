import GoogleProvider from 'next-auth/providers/google';
const allowed=new Set(['vanedrn203@gmail.com','candyalvarez84@gmail.com']);
export const authOptions={
 providers:[GoogleProvider({clientId:process.env.GOOGLE_CLIENT_ID||'not-configured',clientSecret:process.env.GOOGLE_CLIENT_SECRET||'not-configured'})],
 secret:process.env.NEXTAUTH_SECRET,
 callbacks:{
 async signIn({user,account,profile}){return account?.provider==='google'&&Boolean(profile?.email_verified)&&allowed.has((user.email||'').toLowerCase())},
 async session({session}){if(session.user)session.user.isAdmin=allowed.has((session.user.email||'').toLowerCase());return session}
 },
 pages:{signIn:'/admin'}
};
export async function isAdmin(session){return Boolean(session?.user?.isAdmin&&allowed.has((session.user.email||'').toLowerCase()))}
