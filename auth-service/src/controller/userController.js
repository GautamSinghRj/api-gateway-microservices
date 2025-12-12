import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { generateToken } from '../utility/generateToken';

//After a long debug route I found i only needed to add adapter that connects to database since they are not in the same folder
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: 'Invalid Credentials' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const foundUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (foundUser)
      return res
        .status(409)
        .json({ message: 'Invalid User' });
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    const token = generateToken(user);
    return res
      .status(201)
      .json({ message: 'Thanks, user added in database', token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Server error', error: err });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: 'Invalid Credentials' });
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user)
      return res.status(404).json({ message: 'Invalid User' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid Password' });
    const token = generateToken(user);
    return res
      .status(200)
      .json({ message: `Welcome ${user.name || ''}`, token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Server error', error: err });
  }
};

export const healthCheck = (req, res) => {
  console.log("HEALTH CHECK CALLED");
  return res.sendStatus(200);
  console.log("Health Check response sent")
};
