import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoriteService {
    constructor(
        private prismaService: PrismaService,
    ){}

    // async getFavoriteME(dto)
}
