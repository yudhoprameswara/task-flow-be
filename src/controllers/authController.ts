import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel';
import { registerSchema, loginSchema } from '../validations/authValidation';
import { IApiResponse } from '../types/interfaces';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {

    const { body } = registerSchema.parse({ body: req.body });


    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      } satisfies IApiResponse);
      return;
    }

    const user = await User.create({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    } satisfies IApiResponse);
  } catch (error) {
    next(error);
  }
};


export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {

    const { body } = loginSchema.parse({ body: req.body });
    const user = await User.findOne({ email: body.email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      } satisfies IApiResponse);
      return;
    }

    const isPasswordValid = await user.comparePassword(body.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      } satisfies IApiResponse);
      return;
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    } satisfies IApiResponse);
  } catch (error) {
    next(error);
  }
};


export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } satisfies IApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    } satisfies IApiResponse);
  } catch (error) {
    next(error);
  }
};
