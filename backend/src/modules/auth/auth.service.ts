import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { RegisterInput, LoginInput } from './auth.schemas';

interface TokenPayload {
  userId: string;
  email: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  tokens: TokenPair;
}

export class AuthService {
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private generateAccessToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: env.JWT_ACCESS_EXPIRY as any,
    };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
  }

  private generateRefreshToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRY as any,
    };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    // Delete old refresh tokens for this user
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Calculate expiry date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save new refresh token
    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(input.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
      },
    });

    // Generate tokens
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Save refresh token
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.comparePasswords(input.password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate tokens
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Save refresh token
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken) {
        throw new AppError(401, 'Invalid refresh token');
      }

      // Check if token is expired
      if (storedToken.expiresAt < new Date()) {
        await prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });
        throw new AppError(401, 'Refresh token has expired');
      }

      // Generate new tokens
      const payload: TokenPayload = {
        userId: decoded.userId,
        email: decoded.email,
      };

      const newAccessToken = this.generateAccessToken(payload);
      const newRefreshToken = this.generateRefreshToken(payload);

      // Rotate refresh token (delete old, save new)
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      await this.saveRefreshToken(decoded.userId, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(401, 'Refresh token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(401, 'Invalid refresh token');
      }
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    // Delete refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }
}

export const authService = new AuthService();
