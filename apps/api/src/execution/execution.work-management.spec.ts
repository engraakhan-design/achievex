import { BadRequestException } from '@nestjs/common';
import { ExecutionService } from './execution.service';

describe('ExecutionService work management', () => {
  const prisma: any = {
    projectTask: { findFirst: jest.fn() },
    projectTaskDependency: { findMany: jest.fn(), create: jest.fn() },
    executionActivity: { create: jest.fn() },
  };
  const events: any = { publish: jest.fn() };
  const service = new ExecutionService(prisma, {} as any, events);

  beforeEach(() => jest.clearAllMocks());

  it('rejects a task dependency that creates a cycle', async () => {
    prisma.projectTask.findFirst
      .mockResolvedValueOnce({ id: 'task-a', projectId: 'project-1' })
      .mockResolvedValueOnce({ id: 'task-b', projectId: 'project-1' });
    prisma.projectTaskDependency.findMany.mockResolvedValue([
      { predecessorTaskId: 'task-b', successorTaskId: 'task-a' },
    ]);

    await expect(service.createTaskDependency('org-1', 'user-1', {
      predecessorTaskId: 'task-a', successorTaskId: 'task-b',
    })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects dependencies across projects', async () => {
    prisma.projectTask.findFirst
      .mockResolvedValueOnce({ id: 'task-a', projectId: 'project-1' })
      .mockResolvedValueOnce({ id: 'task-b', projectId: 'project-2' });

    await expect(service.createTaskDependency('org-1', 'user-1', {
      predecessorTaskId: 'task-a', successorTaskId: 'task-b',
    })).rejects.toBeInstanceOf(BadRequestException);
  });
});
