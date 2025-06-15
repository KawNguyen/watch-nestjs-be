import { ForbiddenException } from '@nestjs/common';

export function assertCanAccessResource(
  targetUserId: string,
  requesterId: string,
  requesterRole: string,
  options: {
    allowAdmin?: boolean;
    action?: string;
  } = {},
) {
  const { allowAdmin = true, action = 'access' } = options;

  const isAdmin = requesterRole === 'ADMIN';
  const isOwner = targetUserId === requesterId;

  if (!isOwner && !(allowAdmin && isAdmin)) {
    throw new ForbiddenException(
      `You do not have permission to ${action} this resource.`,
    );
  }
}
