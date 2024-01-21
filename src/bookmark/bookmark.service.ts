import {
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateBookmarkDto,
  EditBookmarkDto,
} from "./dto";

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  async createBookmark(
    userId: number,
    dto: CreateBookmarkDto,
  ) {
    const bookmark =
      await this.prisma.bookmark.create({
        data: {
          userId: userId,
          title: dto.title,
          description: dto?.description,
          link: dto.link,
        },
      });
    return bookmark;
  }

  async getBookmarks(userId: number) {
    const bookmarks =
      this.prisma.bookmark.findMany({
        where: {
          userId: userId,
        },
      });
    return bookmarks;
  }

  async getBookmarkById(userId, bookmarkId) {
    const bookmark =
      await this.prisma.bookmark.findUnique({
        where: {
          id: bookmarkId,
        },
      });

    if (bookmark.userId !== userId) {
      throw new ForbiddenException(
        "You are not allowed to access this resource",
      );
    }

    return bookmark;
  }

  async updateBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    const bookmark =
      await this.prisma.bookmark.findUnique({
        where: {
          id: bookmarkId,
        },
      });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException(
        "You are not allowed to access this resource",
      );
    }

    return await this.prisma.bookmark.update({
      where: { id: bookmarkId },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmarkById(
    userId: number,
    bookmarkId: number,
  ) {
    const bookmark =
      await this.prisma.bookmark.findUnique({
        where: {
          id: bookmarkId,
        },
      });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException(
        "You are not allowed to access this resource",
      );
    }
    await this.prisma.bookmark.delete({
      where: { id: bookmarkId },
    });
  }
}
