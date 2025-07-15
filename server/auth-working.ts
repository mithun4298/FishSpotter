import session from "express-session";
import type { Express, RequestHandler } from "express";
import { DatabaseStorage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store for now
  return session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  const storage = new DatabaseStorage();

  // Login endpoint with proper password validation
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Validate password (for now using simple comparison, in production use bcrypt)
      if (user.hashedPassword !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.userEmail = email;

      res.json({ 
        message: "Login successful", 
        user: { email, id: user.id } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Signup endpoint - creates new users only
  app.post("/api/auth/signup", async (req: any, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user with the provided password (in production, hash it)
      const userId = await storage.createUser({
        email,
        hashedPassword: password, // Store the actual password for now
        firstName: "Test",
        lastName: "User"
      });

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(500).json({ message: "Failed to create user" });
      }

      req.session.userId = user.id;
      req.session.userEmail = email;

      res.status(201).json({ 
        message: "User created successfully", 
        user: { email, id: user.id } 
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  // GET logout endpoint for direct browser navigation
  app.get("/api/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.redirect("/?error=logout_failed");
      }
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  console.log("Session check:", { 
    sessionId: req.sessionID, 
    userId: req.session?.userId 
  });
  
  if (req.session?.userId) {
    // Add user info to request for convenience
    req.user = { claims: { sub: req.session.userId } };
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}
