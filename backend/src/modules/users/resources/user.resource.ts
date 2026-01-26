export class UserResource {
  uuid: string;
  username: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  roles: {
    uuid: string;
    name: string;
    code: string;
    description?: string;
  }[];
  activeRole: {
    uuid: string;
    name: string;
    code: string;
    description?: string;
  } | null;

  constructor(user: any) {
    this.uuid = user.uuid;
    this.username = user.username;
    this.fullName = user.fullName;
    this.email = user.email;
    this.phone = user.phone || null;
    this.avatar = user.avatar || null;
    this.isActive = user.isActive;
    this.verifiedAt = user.verifiedAt?.toISOString?.() || user.verifiedAt || null;
    this.createdAt = user.createdAt?.toISOString?.() || user.createdAt;
    this.updatedAt = user.updatedAt?.toISOString?.() || user.updatedAt;
    this.createdBy = user.createdBy || null;
    this.updatedBy = user.updatedBy || null;

    // Map userRoles to roles array
    this.roles = user.userRoles?.map((userRole: any) => ({
      uuid: userRole.role.uuid,
      name: userRole.role.name,
      code: userRole.role.code,
      description: userRole.role.description,
    })) || [];

    // Set active role from database or default to first role
    if (user.activeRole) {
      this.activeRole = {
        uuid: user.activeRole.uuid,
        name: user.activeRole.name,
        code: user.activeRole.code,
        description: user.activeRole.description,
      };
    } else {
      this.activeRole = this.roles[0] || null;
    }
  }

  static collection(users: any[]): UserResource[] {
    return users.map((user) => new UserResource(user));
  }

  toJSON() {
    return {
      uuid: this.uuid,
      username: this.username,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      avatar: this.avatar,
      isActive: this.isActive,
      verifiedAt: this.verifiedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      roles: this.roles,
      activeRole: this.activeRole,
    };
  }
}
