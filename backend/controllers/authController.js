const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { sendMail } = require('../utils/mailer');
require('dotenv').config();


async function signup(req, res) {
    const { name, email, password, role } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: hash, role: role || 'warehouse_staff' });
    res.json({ id: user.id, email: user.email, name: user.name });
}


async function login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}


async function requestPasswordReset(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'No user with that email' });
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await PasswordReset.create({ email, otp, expiresAt });
    await sendMail(email, 'Your StockMaster OTP', `Your OTP: ${otp}. Expires in 15 minutes.`);
    res.json({ ok: true });
}


async function verifyOtpAndReset(req, res) {
    const { email, otp, newPassword } = req.body;
    const pr = await PasswordReset.findOne({ where: { email, otp, used: false }, order: [['createdAt', 'DESC']] });
    if (!pr) return res.status(400).json({ error: 'Invalid OTP' });
    if (pr.expiresAt < new Date()) return res.status(400).json({ error: 'OTP expired' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'User not found' });
    const hash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hash;
    await user.save();
    pr.used = true;
    await pr.save();
    res.json({ ok: true });
}


async function updateProfile(req, res) {
    const { name, email } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}


async function getMe(req, res) {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}

module.exports = { signup, login, requestPasswordReset, verifyOtpAndReset, updateProfile, getMe };