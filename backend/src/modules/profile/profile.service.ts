import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/profile.dto';
import { hashPassword, comparePassword } from '../../common/utils/hash.util';
import { UserResource } from '../users/resources/user.resource';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) { }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        userRoles: {
          include: { role: true },
          where: { deletedAt: null }
        }
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    return { message: 'Success', data: new UserResource(user) };
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: updateProfileDto.email, deletedAt: null, id: { not: userId } },
      });
      if (existingEmail) {
        throw new BadRequestException('Email sudah digunakan.');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: updateProfileDto.name,
        email: updateProfileDto.email,
        updatedAt: new Date(),
      },
      include: {
        userRoles: {
          include: { role: true },
          where: { deletedAt: null }
        }
      },
    });

    return { message: 'Profil berhasil diperbarui.', data: new UserResource(updatedUser) };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    const isPasswordValid = await comparePassword(changePasswordDto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Password saat ini tidak valid.');
    }

    const hashedPassword = await hashPassword(changePasswordDto.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return { message: 'Password berhasil diubah.', data: {} };
  }

  async updateAvatar(userId: number, avatarPath: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatar: avatarPath,
        updatedAt: new Date(),
      },
      include: {
        userRoles: {
          include: { role: true },
          where: { deletedAt: null }
        }
      },
    });

    return { message: 'Foto profil berhasil diubah.', data: new UserResource(updatedUser) };
  }

  async deleteAvatar(userId: number, uuid: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, uuid, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan atau UUID tidak valid.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatar: null,
        updatedAt: new Date(),
      },
      include: {
        userRoles: {
          include: { role: true },
          where: { deletedAt: null }
        }
      },
    });

    return { message: 'Foto profil berhasil dihapus.', data: new UserResource(updatedUser) };
  }

  async getAvatar(uuid: string) {
    const user = await this.prisma.user.findFirst({
      where: { uuid, deletedAt: null },
    });

    if (!user || !user.avatar) {
      throw new NotFoundException('Avatar tidak ditemukan.');
    }

    return user.avatar;
  }
}
