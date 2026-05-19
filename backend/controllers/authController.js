const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const signToken = (user) => jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  const { email, password, nome } = req.body;
  if (!email || !password || !nome)
    return res.status(400).json({ error: 'email, password e nome sono obbligatori' });

  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ error: 'Email già registrata' });

  const user = await User.create({ email, password, nome });
  res.status(201).json({ token: signToken(user), user });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'email e password sono obbligatori' });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ error: 'Credenziali non valide' });

  res.json({ token: signToken(user), user });
};

exports.me = async (req, res) => {
  res.json(req.user);
};
