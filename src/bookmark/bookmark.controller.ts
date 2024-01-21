import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtGuard } from "../auth/guard";
import { BookmarkService } from "./bookmark.service";
import { GetUser } from "../auth/decorators";
import {
  CreateBookmarkDto,
  EditBookmarkDto,
} from "./dto";
import { PrismaService } from "../prisma/prisma.service";

@UseGuards(JwtGuard)
@Controller("bookmarks")
export class BookmarkController {
  constructor(
    private prisma: PrismaService,
    private bookmarksService: BookmarkService,
  ) {}

  @Post()
  createBookmark(
    @GetUser("id") userId: number,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.bookmarksService.createBookmark(
      userId,
      dto,
    );
  }

  @Get()
  getBookmarks(@GetUser("id") userId: number) {
    return this.bookmarksService.getBookmarks(
      userId,
    );
  }

  @Get(":id")
  getBookmarkById(
    @GetUser("id") userId: number,
    @Param("id", ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarksService.getBookmarkById(
      userId,
      bookmarkId,
    );
  }

  @Patch(":id")
  updateBookmarkById(
    @GetUser("id") userId: number,
    @Param("id", ParseIntPipe) bookmarkId: number,
    @Body() dto: EditBookmarkDto,
  ) {
    return this.bookmarksService.updateBookmarkById(
      userId,
      bookmarkId,
      dto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  deleteBookmarkById(
    @GetUser("id") userId: number,
    @Param("id", ParseIntPipe) bookmarkId: number,
  ) {
    this.bookmarksService.deleteBookmarkById(
      userId,
      bookmarkId,
    );
  }
}
