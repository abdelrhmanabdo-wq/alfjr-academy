const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        teacher: { select: { id: true, name: true } },
        supervisor: { select: { id: true, name: true, isHead: true } },
        parent: { select: { id: true, name: true } }
      }
    });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safe } = user;
    res.json({ token, user: safe });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/setup', async (req, res) => {
  try {
    const exists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (exists) return res.status(403).json({ error: 'Setup already done' });
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email: email.toLowerCase(), password: hashed, role: 'ADMIN' } });
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        teacher: { select: { id: true, name: true } },
        supervisor: { select: { id: true, name: true, isHead: true } },
        parent: { select: { id: true, name: true } }
      }
    });
    const { password: _, ...safe } = user;
    res.json(safe);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Wrong current password' });
    await prisma.user.update({ where: { id: req.user.id }, data: { password: await bcrypt.hash(newPassword, 12) } });
    res.json({ message: 'Password updated' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
