import { IsString, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class AddFavoriteDto {
    @IsString()
    @IsUUID()
    userId: string;

    @IsString()
    @IsUUID()
    watchId: string;
}

export class RemoveFavoriteDto {
    @IsString()
    @IsUUID()
    userId: string;

    @IsString()
    @IsUUID()
    watchId: string;
}

export class FavoriteResponseDto {
    @IsString()
    @IsUUID()
    id: string;

    @IsString()
    @IsUUID()
    userId: string;

    @IsString()
    @IsUUID()
    watchId: string;

    @IsDateString()
    createdAt: Date;

    @IsDateString()
    updatedAt: Date;

    @IsOptional()
    user?: any;

    @IsOptional()
    watch?: any;
}