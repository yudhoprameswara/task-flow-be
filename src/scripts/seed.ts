import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/userModel';
import { Task } from '../models/taskModel';

const dummyTasks = [
  {
    title: 'Design Landing Page',
    description: 'Create a high-fidelity mockup for the new landing page.',
    status: 'in-progress',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  },
  {
    title: 'Implement Authentication',
    description: 'Set up JWT and login/register endpoints.',
    status: 'done',
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    title: 'Database Schema Setup',
    description: 'Define Mongoose schemas for Users and Tasks.',
    status: 'done',
    deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Unit Testing for API',
    description: 'Write Jest tests for all controller functions.',
    status: 'pending',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Bug Fix: Dashboard Stats',
    description: "The 'total' count is not updating after deletion.",
    status: 'in-progress',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Integrate Google Maps API',
    description: 'Add location tracking to tasks.',
    status: 'pending',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Review PR: Frontend Redesign',
    description: 'Review the code changes for the new UI components.',
    status: 'in-progress',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Optimize MongoDB Queries',
    description: 'Add indexes to frequently queried fields like user_id and status.',
    status: 'pending',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Set up CI/CD Pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment.',
    status: 'done',
    deadline: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'User Profile Page',
    description: 'Allow users to update their name and password.',
    status: 'pending',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Dark Mode Support',
    description: 'Implement theme switching in the frontend.',
    status: 'in-progress',
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Export Tasks to CSV',
    description: 'Create an endpoint to download tasks in CSV format.',
    status: 'pending',
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Mobile Responsiveness',
    description: 'Fix layout issues on screens smaller than 768px.',
    status: 'done',
    deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'API Documentation',
    description: 'Write Swagger docs for all available routes.',
    status: 'in-progress',
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Social Media Integration',
    description: 'Allow sharing task progress on LinkedIn.',
    status: 'pending',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
];

const seed = async () => {
  try {
    await connectDB();

    // 1. Find a user to assign tasks to
    const user = await User.findOne();
    
    if (!user) {
      console.error('❌ No users found in database. Please register a user first.');
      process.exit(1);
    }

    console.log(`👤 Seeding tasks for user: ${user.email} (${user._id})`);

    // 2. Prepare tasks with the user's ID
    const tasksToInsert = dummyTasks.map(task => ({
      ...task,
      user_id: user._id
    }));

    // 3. Clear existing tasks for this user (optional - uncomment if you want a fresh start)
    // await Task.deleteMany({ user_id: user._id });
    // console.log('🗑️  Cleared existing tasks for this user.');

    // 4. Insert dummy tasks
    const insertedTasks = await Task.insertMany(tasksToInsert);
    console.log(`✅ Successfully seeded ${insertedTasks.length} tasks!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seed();
