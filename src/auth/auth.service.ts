import {
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto, SignUpDto } from "./dto";
import * as argon from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    // Find user by Email
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (!user)
      throw new ForbiddenException(
        "Credentials incorrect!",
      );

    // Check password
    const isMatch = await argon.verify(
      user.password,
      dto.password,
    );

    if (!isMatch)
      throw new ForbiddenException(
        "Credentials incorrect!",
      );

    // return user token
    return this.signToken(user.id, user.email);
  }

  async signup(dto: SignUpDto) {
    // Create Hash
    const hash = await argon.hash(dto.password);
    try {
      // Create User
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          firstname: dto.firstname,
          lastname: dto.lastname,
          middlename: dto?.middlename,
        },
      });

      // return user token
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === "P2002") {
          throw new ForbiddenException(
            "Credential already exists",
          );
        }
      }
      throw error;
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email: email,
    };
    const secret = this.config.get("JWT_SECRET");
    const token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: "15m",
        secret: secret,
      },
    );

    return {
      access_token: token,
    };
  }
}
