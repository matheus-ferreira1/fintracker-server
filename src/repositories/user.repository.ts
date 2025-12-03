import prisma from "@/config/prisma";
import type { RegisterDTO } from "@/types/auth.types";
import type { UpdateProfileDTO, UserDTO } from "@/types/user.types";
import {} from "@prisma/client";
import type { User } from "generated/prisma/browser";

class UserRepository {
  private mapToDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(payload: RegisterDTO): Promise<UserDTO> {
    return prisma.user.create({
      data: payload,
      omit: {
        password: true,
      },
    });
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<UserDTO | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  async emailExistsExcludingUser(
    email: string,
    userId: string
  ): Promise<boolean> {
    const count = await prisma.user.count({
      where: {
        email,
        NOT: {
          id: userId,
        },
      },
    });
    return count > 0;
  }

  async update(id: string, payload: UpdateProfileDTO): Promise<UserDTO | null> {
    return prisma.user.update({
      where: { id },
      data: payload,
      omit: {
        password: true,
      },
    });
  }

  async updatePassword(id: string, password: string): Promise<UserDTO | null> {
    return prisma.user.update({
      where: { id },
      data: { password },
      omit: {
        password: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
      omit: {
        password: true,
      },
    });
  }
}

export const userRepository = new UserRepository();
