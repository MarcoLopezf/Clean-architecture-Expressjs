import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

import { UsersController } from '../../../../../../src/infrastructure/adapters/http/controllers/UsersController';
import type { CreateUserUseCase } from '../../../../../../src/application/use-cases/users/CreateUserUseCase';
import type { UpdateUserProfileUseCase } from '../../../../../../src/application/use-cases/users/UpdateUserProfileUseCase';
import type { ToggleUserStatusUseCase } from '../../../../../../src/application/use-cases/users/ToggleUserStatusUseCase';
import type { ListUsersUseCase } from '../../../../../../src/application/use-cases/users/ListUsersUseCase';
import type { GetUserByIdUseCase } from '../../../../../../src/application/use-cases/users/GetUserByIdUseCase';
import type { LoggerPort } from '../../../../../../src/application/ports/logger.port';

const noopUseCase = { execute: vi.fn() } as unknown as CreateUserUseCase;
const noopUpdateUseCase = { execute: vi.fn() } as unknown as UpdateUserProfileUseCase;
const noopListUseCase = { execute: vi.fn() } as unknown as ListUsersUseCase;
const noopGetUseCase = { execute: vi.fn() } as unknown as GetUserByIdUseCase;

const createLogger = () => {
  const child = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn()
  } as unknown as LoggerPort;

  const rootLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn().mockReturnValue(child)
  } as unknown as LoggerPort;

  return { rootLogger, childLogger: child };
};

describe('UsersController.toggleStatus', () => {
  it('passes the boolean flag without coercion', async () => {
    const toggleUserStatus = { execute: vi.fn().mockResolvedValue({ id: 'user-1' }) } as unknown as ToggleUserStatusUseCase;
    const { rootLogger } = createLogger();
    const controller = new UsersController(
      noopUseCase,
      noopUpdateUseCase,
      toggleUserStatus,
      noopListUseCase,
      noopGetUseCase,
      rootLogger
    );

    const req = {
      params: { id: 'user-1' },
      body: { isActive: false }
    } as unknown as Request;

    const res = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis()
    } as unknown as Response;

    const next = vi.fn();

    await controller.toggleStatus(req, res, next);

    expect(toggleUserStatus.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      isActive: false
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects when the flag is missing', async () => {
    const toggleUserStatus = { execute: vi.fn() } as unknown as ToggleUserStatusUseCase;
    const { rootLogger, childLogger } = createLogger();
    const controller = new UsersController(
      noopUseCase,
      noopUpdateUseCase,
      toggleUserStatus,
      noopListUseCase,
      noopGetUseCase,
      rootLogger
    );

    const req = {
      params: { id: 'user-1' },
      body: {}
    } as unknown as Request;

    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    } as unknown as Response;

    const next = vi.fn();

    await controller.toggleStatus(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(childLogger.error).toHaveBeenCalledWith('Failed to toggle user status', {
      error: expect.any(Error)
    });
    expect(toggleUserStatus.execute).not.toHaveBeenCalled();
  });
});
