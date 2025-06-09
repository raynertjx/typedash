const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const prisma = require('../prismaclient');

router.post('/', checkNotAuthenticated, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    async function validation() {
      const checkName = await prisma.users.findUnique({
        where: {
          name: name,
        },
      });
      if (checkName !== null) {
        return res.status(409).json({ message: 'Username already in use' });
      }
      const checkEmail = await prisma.users.findUnique({
        where: {
          email: email,
        },
      });
      if (checkEmail !== null) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      return null;
    }
    const error = await validation();

    if (error !== null) {
      await prisma.$disconnect();
      return error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    async function main() {
      await prisma.users.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
        },
      });
    }
    main()
      .then(async () => {
        await prisma.$disconnect();
        return res.status(201).json({ message: 'Registration successful' });
      })
      .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        throw e;
      });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed' });
  }
});

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.status(403).json({ message: 'Already authenticated' });
  }
  next();
}

module.exports = router;
