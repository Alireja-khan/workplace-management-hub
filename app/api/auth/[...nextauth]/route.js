import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password');
        }

        try {
          await connectToDatabase();
        } catch (dbErr) {
          console.error('Database connection error in authorize:', dbErr);
          throw new Error('Database connection failed. Please try again in a moment.');
        }

        const email = credentials.email.toLowerCase().trim();
        const user = await User.findOne({ email });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || '',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'antigravity-workplace-hub-secret-2026-key',
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectToDatabase();
          const email = user.email?.toLowerCase().trim();
          let existingUser = await User.findOne({ email });
          if (!existingUser) {
            existingUser = await User.create({
              name: user.name || 'Google User',
              email,
              image: user.image || '',
              role: 'Visitor',
              assignedName: '',
            });
          } else if (user.image && !existingUser.image) {
            existingUser.image = user.image;
            await existingUser.save();
          }
          user.id = existingUser._id.toString();
        } catch (error) {
          console.error('Error saving Google user to MongoDB:', error);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        try {
          await connectToDatabase();
          const dbUser = await User.findById(token.id || token.sub);
          session.user.id = token.id || token.sub;
          session.user.email = token.email;
          session.user.name = token.name;
          session.user.image = token.picture;
          session.user.role = dbUser?.role || 'Visitor';
          session.user.assignedName = dbUser?.assignedName || '';
        } catch (error) {
          console.error('Session DB Fetch Error:', error);
          session.user.role = 'Visitor';
          session.user.assignedName = '';
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
