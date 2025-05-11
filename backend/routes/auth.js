import express from "express";
import { authController } from "../controllers/authController.js";

const router = express.Router();

// Register a new user (student or professor)
router.post("/register", async (req, res) => {
  try {
    console.log(req.body); // Log the incoming request body
    const result = await authController.register(req);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  try {
    console.log(req.body); // Log the incoming request body
    const result = await authController.login(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Get user profile (protected)
router.get("/profile", async (req, res) => {
  try {
    const user = await authController.getProfile(req);
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Logout (requires revoked_tokens table)
router.post("/logout", async (req, res) => {
  try {
    console.log(req.body); // Log the incoming request body
    const result = await authController.logout(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Login endpoint without password hashing
router.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    console.log("Request body:", req.body); // Log the incoming request body

    

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Password incorrect" });
    }

    if (user.password !== password) {
      console.log("Password does not match"); // Log if password is incorrect
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token or session
    const token = generateToken(user.id);
    res.json({ token, user });
  } catch (error) {
    console.error("Error during login:", error.message); // Log the error
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

// Register endpoint without password hashing
router.post("/api/auth/register", async (req, res) => {
  const { email, password, role, ...otherFields } = req.body;

  // Validate required fields
  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Email, password, and role are required" });
  }

  // Validate role
  const validRoles = ["student", "teacher"];
  if (!validRoles.includes(role)) {
    return res
      .status(400)
      .json({ message: 'Invalid role. Must be "student" or "teacher".' });
  }

  try {
    console.log(req.body); // Log the incoming request body
    // Save the user with the plain-text password
    const newUser = new User({ email, password, role, ...otherFields });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
});

export default router;
