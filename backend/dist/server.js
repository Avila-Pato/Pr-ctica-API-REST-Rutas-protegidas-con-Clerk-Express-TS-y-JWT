import 'dotenv/config';
import express from 'express';

import { clerkMiddleware, requireAuth, clerkClient } from '@clerk/express';

const app = express();
const PORT = process.env.PORT || 3e3;
app.use(clerkMiddleware());
app.get("/api", (req, res) => {
  res.json({ message: "Hello world" });
});
app.get(
  "/api/protected",
  requireAuth({ signInUrl: "/api/unauthorized" }),
  // Middleware que redirige si no está autenticado
  async (req, res) => {
    if (!req.auth) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { userId } = req.auth;
    const user = await clerkClient.users.getUser(userId);
    res.json({ user });
  }
);
app.get("/api/unauthorized", (req, res) => {
  res.status(401).json({ message: "Unauthorized...." });
});
app.listen(PORT, () => {
  console.log(`Server running on Port:${PORT}`);
});
