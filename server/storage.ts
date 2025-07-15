import {
  users,
  fishIdentifications,
  type User,
  type UpsertUser,
  type FishIdentification,
  type InsertFishIdentification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Authentication operations
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: { email: string; hashedPassword: string; firstName: string; lastName: string }): Promise<string>;
  
  // Fish identification operations
  createFishIdentification(identification: InsertFishIdentification): Promise<FishIdentification>;
  getFishIdentificationsByUser(userId: string): Promise<FishIdentification[]>;
  getFishIdentification(id: number): Promise<FishIdentification | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Authentication operations
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: { email: string; hashedPassword: string; firstName: string; lastName: string }): Promise<string> {
    const [user] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        ...userData,
      })
      .returning();
    return user.id;
  }

  // Fish identification operations
  async createFishIdentification(identification: InsertFishIdentification): Promise<FishIdentification> {
    const [result] = await db
      .insert(fishIdentifications)
      .values(identification)
      .returning();
    return result;
  }

  async getFishIdentificationsByUser(userId: string): Promise<FishIdentification[]> {
    return await db
      .select()
      .from(fishIdentifications)
      .where(eq(fishIdentifications.userId, userId))
      .orderBy(desc(fishIdentifications.createdAt));
  }

  async getFishIdentification(id: number): Promise<FishIdentification | undefined> {
    const [result] = await db
      .select()
      .from(fishIdentifications)
      .where(eq(fishIdentifications.id, id));
    return result;
  }
}

export const storage = new DatabaseStorage();
