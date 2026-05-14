import { User } from '../models/User.js';

const PUBLIC_FIELDS = '-password';

function handleDuplicateKey(err, res) {
  if (err && err.code === 11000 && err.keyPattern && err.keyPattern.email) {
    res.status(409).json({ message: 'Email already in use' });
    return true;
  }
  return false;
}

export async function listUsers(req, res, next) {
  try {
    const { user_type, q } = req.query;
    const filter = {};
    if (user_type) filter.user_type = user_type;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select(PUBLIC_FIELDS).sort({ createdAt: -1 });
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select(PUBLIC_FIELDS);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createUser(req, res, next) {
  try {
    const { email, name, password, user_type, address } = req.body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ message: '이메일 형식이 올바르지 않습니다.' });
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: '이름을 입력해주세요.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: '비밀번호는 6자 이상이어야 합니다.' });
    }
    if (user_type !== undefined && !['customer', 'admin'].includes(user_type)) {
      return res.status(400).json({ message: 'user_type 값이 올바르지 않습니다.' });
    }

    const user = await User.create({
      email: email.trim(),
      name: name.trim(),
      password,
      user_type,
      address,
    });
    const safeUser = user.toObject();
    delete safeUser.password;
    res.status(201).json({ data: safeUser });
  } catch (err) {
    if (handleDuplicateKey(err, res)) return;
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { email, name, password, user_type, address } = req.body;
    if (email !== undefined) user.email = email;
    if (name !== undefined) user.name = name;
    if (password !== undefined) user.password = password;
    if (user_type !== undefined) user.user_type = user_type;
    if (address !== undefined) user.address = address;

    await user.save();
    const safeUser = user.toObject();
    delete safeUser.password;
    res.json({ data: safeUser });
  } catch (err) {
    if (handleDuplicateKey(err, res)) return;
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
