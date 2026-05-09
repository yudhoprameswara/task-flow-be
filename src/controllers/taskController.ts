import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Task } from '../models/taskModel';
import { createTaskSchema, updateTaskSchema } from '../validations/taskValidation';
import { IApiResponse, TaskStatus, IPaginatedResponse, ITaskDocument } from '../types/interfaces';

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { status, search, page = '1', limit = '20' } = req.query;

    const filter: Record<string, unknown> = { user_id: new Types.ObjectId(userId) };

    if (status && ['pending', 'in-progress', 'done'].includes(status as string)) {
      filter.status = status as TaskStatus;
    }

    if (search && typeof search === 'string' && search.trim()) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total, statusCounts] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Task.countDocuments(filter),
      Task.aggregate([
        { $match: { user_id: new Types.ObjectId(userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const stats = {
      total: statusCounts.reduce((acc, curr) => acc + curr.count, 0),
      pending: statusCounts.find((s) => s._id === 'pending')?.count || 0,
      'in-progress': statusCounts.find((s) => s._id === 'in-progress')?.count || 0,
      done: statusCounts.find((s) => s._id === 'done')?.count || 0,
    };

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: tasks,
      total,
      stats,
      page: pageNum,
      limit: limitNum,
    } satisfies IPaginatedResponse<ITaskDocument>);
  } catch (error) {
    next(error);
  }
};


export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    if (!Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid task ID' } satisfies IApiResponse);
      return;
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user_id: new Types.ObjectId(userId),
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      } satisfies IApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: task,
    } satisfies IApiResponse);
  } catch (error) {
    next(error);
  }
};


export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { body } = createTaskSchema.parse({ body: req.body });

    const task = await Task.create({
      title: body.title,
      description: body.description,
      status: body.status,
      deadline: body.deadline ? new Date(body.deadline) : undefined,
      user_id: new Types.ObjectId(userId),
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    } satisfies IApiResponse);
  } catch (error) {
    next(error);
  }
};


export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    if (!Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid task ID' } satisfies IApiResponse);
      return;
    }

    const { body } = updateTaskSchema.parse({ body: req.body });

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.deadline !== undefined) {
      updateData.deadline = body.deadline ? new Date(body.deadline) : null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user_id: new Types.ObjectId(userId) },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      } satisfies IApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    } satisfies IApiResponse);
  } catch (error) {
    next(error);
  }
};


export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    if (!Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid task ID' } satisfies IApiResponse);
      return;
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user_id: new Types.ObjectId(userId),
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      } satisfies IApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    } satisfies IApiResponse);
  } catch (error) {
    next(error);
  }
};
