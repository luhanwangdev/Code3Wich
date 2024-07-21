import { describe, it, expect, vi, beforeEach } from 'vitest';
import pool from './databasePool.ts';
import * as userModel from './user.ts';
import AppError from '../utils/appError.ts';

vi.mock('./databasePool.ts', () => ({
  default: {
    query: vi.fn()
  }
}));

describe('getUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user data when DB query is successful', async () => {
    const mockUser = {
      id: 1,
      name: 'Test',
      email: 'test@example.com',
      password: 'test',
      picture: null
    };
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([[mockUser]]);

    const result = await userModel.getUser(1);

    expect(pool.query).toHaveBeenCalledWith(
      `
      SELECT * FROM user
      WHERE id = ?
      `,
      [1]
    );
    expect(result).toEqual(mockUser);
  });

  it('should throw an AppError when user is not found', async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([[]]);

    await expect(userModel.getUser(1)).rejects.toThrow(AppError);
    await expect(userModel.getUser(1)).rejects.toThrow('User not found');
    await expect(userModel.getUser(1)).rejects.toHaveProperty(
      'statusCode',
      404
    );

    expect(pool.query).toHaveBeenCalledWith(
      `
      SELECT * FROM user
      WHERE id = ?
      `,
      [1]
    );
  });
});

describe('createUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a user successfully', async () => {
    const mockResults = [{ insertId: 1 }];
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

    const user = await userModel.createUser(
      'Test',
      'test@example.com',
      'password123'
    );

    expect(pool.query).toHaveBeenCalledWith(
      `
      INSERT INTO user(name, email, password)
      VALUES (?, ?, ?)
      `,
      ['Test', 'test@example.com', 'password123']
    );

    expect(user).toEqual({
      id: 1,
      name: 'Test',
      email: 'test@example.com'
    });
  });

  it('should throw an AppError if results do not contain the expected structure', async () => {
    const mockResults = [{}];
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

    await expect(
      userModel.createUser('Test', 'test@example.com', 'password123')
    ).rejects.toThrow(AppError);
    await expect(
      userModel.createUser('Test', 'test@example.com', 'password123')
    ).rejects.toThrow('create user failed');
    await expect(
      userModel.createUser('Test', 'test@example.com', 'password123')
    ).rejects.toHaveProperty('statusCode', 400);
  });
});

describe('checkUserByEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user data when DB query is successful', async () => {
    const mockUser = {
      id: 1,
      name: 'Test',
      email: 'test@example.com',
      password: 'test',
      picture: null
    };
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([[mockUser]]);

    const result = await userModel.checkUserByEmail('test@example.com');

    expect(pool.query).toHaveBeenCalledWith(
      `
      SELECT * FROM user
      WHERE email = ?
      `,
      ['test@example.com']
    );
    expect(result).toEqual(mockUser);
  });

  it('should return undefined when user is not found', async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([[]]);

    const result = await userModel.checkUserByEmail('test@example.com');

    expect(pool.query).toHaveBeenCalledWith(
      `
      SELECT * FROM user
      WHERE email = ?
      `,
      ['test@example.com']
    );
    expect(result).toEqual(undefined);
  });
});

describe('getUserPasswordByEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user password when DB query is successful', async () => {
    const mockPassword = {
      password: 'test'
    };

    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([
      [mockPassword]
    ]);

    const result = await userModel.getUserPasswordByEmail('test@example.com');

    expect(pool.query).toHaveBeenCalledWith(
      `
      SELECT password FROM user
      WHERE email = ?
      `,
      ['test@example.com']
    );
    expect(result).toEqual(mockPassword.password);
  });

  it('should throw an AppError when user is not found', async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([[]]);

    await expect(
      userModel.getUserPasswordByEmail('test@example.com')
    ).rejects.toThrow(AppError);
    await expect(
      userModel.getUserPasswordByEmail('test@example.com')
    ).rejects.toThrow('User not found');
    await expect(
      userModel.getUserPasswordByEmail('test@example.com')
    ).rejects.toHaveProperty('statusCode', 404);

    expect(pool.query).toHaveBeenCalledWith(
      `
      SELECT password FROM user
      WHERE email = ?
      `,
      ['test@example.com']
    );
  });
});
