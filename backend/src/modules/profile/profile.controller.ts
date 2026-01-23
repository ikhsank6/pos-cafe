import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { existsSync } from 'fs';
import type { Response } from 'express';

@ApiTags('Profile')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req: any) {
    return this.profileService.getProfile(req.user.sub);
  }

  @Post('update')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update profile information' })
  async updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.sub, updateProfileDto);
  }

  @Post('change-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.profileService.changePassword(req.user.sub, changePasswordDto);
  }

  @Post('avatar')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Update user avatar' })
  async updateAvatar(
    @Request() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const avatarPath = `/uploads/avatars/${file.filename}`;
    return this.profileService.updateAvatar(req.user.sub, avatarPath);
  }

  @Delete('avatar/:uuid')
  @ApiOperation({ summary: 'Delete user avatar' })
  async deleteAvatar(@Request() req: any, @Param('uuid') uuid: string) {
    return this.profileService.deleteAvatar(req.user.sub, uuid);
  }

  @Get('avatar/:uuid')
  @ApiOperation({ summary: 'Get user avatar as blob' })
  async getAvatar(@Param('uuid') uuid: string, @Res() res: Response) {
    const avatarPath = await this.profileService.getAvatar(uuid);
    const filePath = join(process.cwd(), avatarPath);

    if (!existsSync(filePath)) {
      return res.status(404).send('Avatar file not found');
    }

    return res.sendFile(filePath);
  }
}
