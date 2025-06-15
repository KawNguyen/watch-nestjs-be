import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export async function validateUserAndWatch(
  prisma: PrismaService,
  userId: string,
  watchId: string,
): Promise<void> {
  const [user, watch] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.watch.findUnique({ where: { id: watchId } }),
  ]);

  if (!user) {
    throw new BadRequestException('User not found');
  }

  if (!watch) {
    throw new BadRequestException('Watch not found');
  }
}