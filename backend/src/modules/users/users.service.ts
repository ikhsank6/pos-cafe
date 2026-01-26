import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { hashPassword } from '../../common/utils/hash.util';
import { buildPaginatedResponse, calculateSkip } from '../../common/utils/pagination.util';
import { QueueService } from '../queue/queue.service';
import { v4 as uuidv4 } from 'uuid';
import { UserResource } from './resources/user.resource';


@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) { }

  async findAll(page = 1, limit = 10, search?: string, isActive?: boolean) {
    const skip = calculateSkip(page, limit);

    const where: any = { deletedAt: null };

    // Apply search filter
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Apply isActive filter
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          userRoles: {
            include: { role: true },
            where: { deletedAt: null }
          },
          activeRole: true
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return buildPaginatedResponse(
      UserResource.collection(users),
      total,
      page,
      limit,
    );
  }

  async findOne(uuid: string) {
    const user = await this.prisma.user.findFirst({
      where: { uuid, deletedAt: null },
      include: {
        userRoles: {
          include: { role: true },
          where: { deletedAt: null }
        },
        activeRole: true
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    return { message: 'Success', data: new UserResource(user) };
  }

  async findById(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        userRoles: {
          include: { role: true },
          where: { deletedAt: null }
        },
        activeRole: true
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    return { message: 'Success', data: new UserResource(user) };
  }

  async create(createUserDto: CreateUserDto, currentUserId?: number) {
    return this.prisma.$transaction(async (prisma) => {
      // Check for existing email
      const existingEmail = await prisma.user.findFirst({
        where: { email: createUserDto.email, deletedAt: null },
      });

      if (existingEmail) {
        throw new BadRequestException('Email sudah terdaftar.');
      }

      // Check for existing username
      const existingUsername = await prisma.user.findFirst({
        where: { username: createUserDto.username, deletedAt: null },
      });

      if (existingUsername) {
        throw new BadRequestException('Username sudah terdaftar.');
      }

      // Handle roleUuids -> roleIds conversion
      const roleIds: number[] = [];
      if (createUserDto.roleUuids && createUserDto.roleUuids.length > 0) {
        for (const roleUuid of createUserDto.roleUuids) {
          const role = await prisma.role.findFirst({
            where: { uuid: roleUuid, deletedAt: null },
          });
          if (!role) {
            throw new BadRequestException(`Role dengan UUID ${roleUuid} tidak ditemukan.`);
          }
          roleIds.push(role.id);
        }
      }

      if (roleIds.length === 0) {
        throw new BadRequestException('roleUuids harus diisi minimal 1 role.');
      }

      const isActive = createUserDto.isActive ?? false;
      let temporaryPassword: string | undefined = undefined;
      let passwordToHash = createUserDto.password;

      if (!passwordToHash) {
        // Generate random 12-character password
        temporaryPassword = Math.random().toString(36).slice(-8) +
          Math.random().toString(36).toUpperCase().slice(-2) +
          "@1"; // Simple safe generation for example
        passwordToHash = temporaryPassword;
      }

      const hashedPassword = await hashPassword(passwordToHash);

      // Generate verification token if user is not active
      const verificationToken = !isActive ? uuidv4() : null;

      const { roleUuids, ...dataWithoutRoleUuids } = createUserDto;
      const user = await prisma.user.create({
        data: {
          username: dataWithoutRoleUuids.username,
          email: dataWithoutRoleUuids.email,
          fullName: dataWithoutRoleUuids.fullName,
          phone: dataWithoutRoleUuids.phone,
          password: hashedPassword,
          isActive,
          // Only set verifiedAt if user is active
          verifiedAt: isActive ? new Date() : null,
          verificationToken,
          // Set first role as active role
          activeRoleId: roleIds[0],
        },
      });

      // Create UserRole relations for all roles
      for (const roleId of roleIds) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: roleId,
          },
        });
      }

      // Get user with roles
      const userWithRoles = await prisma.user.findFirst({
        where: { id: user.id },
        include: {
          userRoles: {
            include: { role: true },
            where: { deletedAt: null }
          },
          activeRole: true
        },
      });

      // Send verification email if user is not active
      if (!isActive && verificationToken) {
        await this.queueService.addVerificationEmailJob({
          email: user.email,
          name: user.fullName,
          verificationToken,
          createdAt: user.createdAt.toISOString(),
          temporaryPassword, // Pass the raw password here to be sent in email
        });
      }

      return {
        message: isActive
          ? 'User berhasil dibuat.'
          : 'User berhasil dibuat. Email verifikasi telah dikirim.',
        data: new UserResource(userWithRoles)
      };
    });
  }

  async update(uuid: string, updateUserDto: UpdateUserDto) {
    return this.prisma.$transaction(async (prisma) => {
      const existing = await prisma.user.findFirst({
        where: { uuid, deletedAt: null },
      });

      if (!existing) {
        throw new NotFoundException('User tidak ditemukan.');
      }

      if (updateUserDto.email) {
        const existingUser = await prisma.user.findFirst({
          where: { email: updateUserDto.email, id: { not: existing.id }, deletedAt: null },
        });
        if (existingUser) {
          throw new BadRequestException('Email sudah digunakan.');
        }
      }

      if (updateUserDto.username) {
        const existingUser = await prisma.user.findFirst({
          where: { username: updateUserDto.username, id: { not: existing.id }, deletedAt: null },
        });
        if (existingUser) {
          throw new BadRequestException('Username sudah digunakan.');
        }
      }

      // Handle roleUuids -> roleIds conversion
      const roleIds: number[] = [];
      if (updateUserDto.roleUuids && updateUserDto.roleUuids.length > 0) {
        for (const roleUuid of updateUserDto.roleUuids) {
          const role = await prisma.role.findFirst({
            where: { uuid: roleUuid, deletedAt: null },
          });
          if (!role) {
            throw new BadRequestException(`Role dengan UUID ${roleUuid} tidak ditemukan.`);
          }
          roleIds.push(role.id);
        }
      }

      const { roleUuids, ...dataWithoutRoleUuids } = updateUserDto;
      const data: any = { ...dataWithoutRoleUuids };

      // Map 'name' to 'fullName' if provided (frontend sends 'name')
      if ((updateUserDto as any).name) {
        data.fullName = (updateUserDto as any).name;
        delete data.name;
      }

      if (updateUserDto.password) {
        data.password = await hashPassword(updateUserDto.password);
      }

      // Update UserRoles if roleIds is provided
      if (roleIds.length > 0) {
        // Hard delete existing roles (to avoid unique constraint issues)
        await prisma.userRole.deleteMany({
          where: { userId: existing.id },
        });

        // Create new role assignments
        for (const roleId of roleIds) {
          await prisma.userRole.create({
            data: {
              userId: existing.id,
              roleId: roleId,
            },
          });
        }

        // Update activeRoleId if current activeRole is not in new roleIds
        if (!roleIds.includes(existing.activeRoleId ?? -1)) {
          data.activeRoleId = roleIds[0];
        }
      }

      const user = await prisma.user.update({
        where: { id: existing.id },
        data,
      });

      // Get user with roles
      const userWithRoles = await prisma.user.findFirst({
        where: { id: user.id },
        include: {
          userRoles: {
            include: { role: true },
            where: { deletedAt: null }
          },
          activeRole: true
        },
      });

      return { message: 'User berhasil diupdate.', data: new UserResource(userWithRoles) };
    });
  }

  async remove(uuid: string) {
    return this.prisma.$transaction(async (prisma) => {
      const existing = await prisma.user.findFirst({
        where: { uuid, deletedAt: null },
      });

      if (!existing) {
        throw new NotFoundException('User tidak ditemukan.');
      }

      // Soft delete
      await prisma.user.update({
        where: { id: existing.id },
        data: { deletedAt: new Date() },
      });

      return { message: 'User berhasil dihapus.', data: {} };
    });
  }

  async resendVerificationEmail(uuid: string) {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: { uuid, deletedAt: null },
      });

      if (!user) {
        throw new NotFoundException('User tidak ditemukan.');
      }

      if (user.verifiedAt) {
        throw new BadRequestException('User sudah terverifikasi.');
      }

      // Generate new verification token
      const verificationToken = uuidv4();

      await prisma.user.update({
        where: { id: user.id },
        data: { verificationToken },
      });

      // Queue verification email
      await this.queueService.addVerificationEmailJob({
        email: user.email,
        name: user.fullName,
        verificationToken,
        createdAt: user.createdAt.toISOString(),
      });

      return {
        message: 'Email verifikasi telah dikirim ulang.',
        data: {}
      };
    });
  }
}
