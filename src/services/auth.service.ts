import { userRepository } from "@/repositories/user.repository";
import { AppError } from "@/types";
import type { AuthResponse, LoginDTO, RegisterDTO } from "@/types/auth.types";
import type { UpdateProfileDTO, UserDTO } from "@/types/user.types";
import { generateToken } from "@/utils/jwt";
import { comparePassword, hashPassword } from "@/utils/password";
import { categoryService } from "./category.service";

class AuthService {
  async register(registerData: RegisterDTO): Promise<AuthResponse> {
    const emailExists = await userRepository.emailExists(registerData.email);
    if (emailExists) {
      throw new AppError(409, "Email already registered");
    }

    const hashedPassword = await hashPassword(registerData.password);

    const user = await userRepository.create({
      ...registerData,
      password: hashedPassword,
    });

    await categoryService.createDefaultCategories(user.id);

    const token = generateToken(user);

    return {
      user,
      token,
    };
  }

  async login(loginData: LoginDTO): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const isPasswordValid = await comparePassword(
      loginData.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new AppError(401, "Invalid email or password");
    }

    const { password, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async validateSession(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(401, "Invalid session");
    }
    return user;
  }

  async resetPassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    const isOldPasswordValid = await comparePassword(
      oldPassword,
      user.password
    );
    if (!isOldPasswordValid) {
      throw new AppError(400, "Current password is incorrect");
    }

    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      throw new AppError(
        400,
        "New password must be different from current password"
      );
    }

    const hashedNewPassword = await hashPassword(newPassword);

    const updated = await userRepository.updatePassword(
      userId,
      hashedNewPassword
    );
    if (!updated) {
      throw new AppError(500, "Failed to update password");
    }
  }

  async updateProfile(
    userId: string,
    updateData: UpdateProfileDTO
  ): Promise<UserDTO> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (updateData.email && updateData.email !== user.email) {
      const emailInUse = await userRepository.emailExistsExcludingUser(
        updateData.email,
        userId
      );
      if (emailInUse) {
        throw new AppError(409, "Email already in use");
      }
    }

    const updatedUser = await userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new AppError(500, "Failed to update profile");
    }

    return updatedUser;
  }
}

export const authService = new AuthService();
