import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from './db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    const existingUserWithGoogle = await db
      .select()
      .from(users)
      .where(eq(users.googleId, profile.id))
      .limit(1);

    if (existingUserWithGoogle.length > 0) {
      return done(null, existingUserWithGoogle[0]);
    }

    // Check if user exists with same email
    const existingUserWithEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, profile.emails?.[0]?.value || ''))
      .limit(1);

    if (existingUserWithEmail.length > 0) {
      // Link Google account to existing email account
      const updatedUser = await db
        .update(users)
        .set({
          googleId: profile.id,
          provider: 'google',
          profileImageUrl: profile.photos?.[0]?.value,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          updatedAt: new Date()
        })
        .where(eq(users.id, existingUserWithEmail[0].id))
        .returning();

      return done(null, updatedUser[0]);
    }

    // Create new user with Google account
    const newUser = await db
      .insert(users)
      .values({
        id: nanoid(),
        email: profile.emails?.[0]?.value,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        profileImageUrl: profile.photos?.[0]?.value,
        googleId: profile.id,
        provider: 'google',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return done(null, newUser[0]);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, false);
  }
}));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user.length > 0) {
      done(null, user[0]);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, false);
  }
});

export default passport;
