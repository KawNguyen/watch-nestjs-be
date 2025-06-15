import { ForbiddenException } from '@nestjs/common';

export function assertIsOwner(
  targetUserId: string,
  requesterId: string,
  action = 'access',
) {
  if (targetUserId !== requesterId) {
    throw new ForbiddenException(
      `You do not have permission to ${action} this resource.`,
    );
  }
}