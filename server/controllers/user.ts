import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import AppError from '../utils/appError.js';
import * as userModel from '../models/user.js';
import * as projectModel from '../models/project.js';

dotenv.config();

interface User {
  id: number;
  name: string;
  email: string;
}

declare module 'express' {
  export interface Request {
    user?: User;
  }
}

const JWTExpired = 86400000;

interface Payload {
  id: number;
  name: string;
  email: string;
}

const jwtTokenGenerator = (payload: Payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY as string, {
    expiresIn: JWTExpired,
  });

  return {
    accessToken: token,
    user: payload,
  };
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };

  const user = await userModel.getUser(id);

  res.status(200).json(user);
};

export const handleSignup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as unknown as {
    name: string;
    email: string;
    password: string;
  };

  if (!(name && email && password)) {
    throw new AppError('Name, email and password are required!', 400);
  }

  const existUser = await userModel.checkUserByEmail(email);
  if (existUser) {
    throw new AppError('The email is already signed up!', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const payload = await userModel.createUser(name, email, hashedPassword);

  const { accessToken, user } = jwtTokenGenerator(payload);

  res.cookie('token', accessToken, {
    maxAge: JWTExpired,
    secure: true,
    sameSite: 'none',
  });

  res.status(200).send(user);
};

export const handleSignin = async (req: Request, res: Response) => {
  const { email, password } = req.body as unknown as {
    email: string;
    password: string;
  };

  if (!(email && password)) {
    throw new AppError('Email and password are required!', 400);
  }

  const hashedPassword = await userModel.getUserPasswordByEmail(email);

  const decoded = bcrypt.compareSync(password, hashedPassword);

  if (decoded) {
    const existUser = await userModel.checkUserByEmail(email);
    const payload = {
      id: existUser.id,
      name: existUser.name,
      email: existUser.email,
    };

    const { accessToken, user } = jwtTokenGenerator(payload);

    res.cookie('token', accessToken, {
      maxAge: JWTExpired,
      secure: true,
      sameSite: 'none',
    });

    res.status(200).send(user);
  } else {
    throw new AppError('Incorrect email or password', 403);
  }
};

export const handleLogout = async (req: Request, res: Response) => {
  res.clearCookie('token');

  res.status(200).send({ message: 'Logout' });
};

export const getUserProjects = async (req: Request, res: Response) => {
  const { id } = req.user as unknown as { id: number };

  const projects = await projectModel.getProjectsByUserId(id);

  res.status(200).send(projects);
};

export const getUserInfo = async (req: Request, res: Response) => {
  const { id, name, email } = req.user as unknown as {
    id: number;
    name: string;
    email: string;
  };

  res.status(200).json({ id, name, email });
};
