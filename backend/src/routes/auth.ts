import { Router } from 'express';
import { AuthService } from '../services/auth.js';
import { getDatabase } from '../db/index.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, organization_id } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const authService = new AuthService(getDatabase());
    const user = await authService.register(email, password, full_name, organization_id);

    res.status(201).json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      organization_id: user.organization_id,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const authService = new AuthService(getDatabase());
    const { token, user } = await authService.login(email, password);

    res.json({ token, user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const authService = new AuthService(getDatabase());
    const user = authService.verifyToken(token);

    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;

