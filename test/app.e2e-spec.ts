import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import {
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from "pactum";
import {
  LoginDto,
  SignUpDto,
} from "../src/auth/dto";
import { EditUserDto } from "../src/user/dto";
import {
  CreateBookmarkDto,
  EditBookmarkDto,
} from "../src/bookmark/dto";

describe("App e2e", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    const PORT = "4389";
    await app.init();
    await app.listen(PORT);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl(
      `http://localhost:${PORT}/`,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Auth", () => {
    describe("Signup", () => {
      it("should return bad request status is email is empty", () => {
        const dto: SignUpDto = {
          email: "",
          password: "123",
          firstname: "firstname",
          lastname: "lastname",
          middlename: "middlename",
        };

        return pactum
          .spec()
          .post("auth/signup")
          .withBody(dto)
          .expectStatus(400);
      });

      it("should signup", () => {
        const dto: SignUpDto = {
          email: "donmode4u@gmail.com",
          password: "123",
          firstname: "firstname",
          lastname: "lastname",
          middlename: "middlename",
        };

        return pactum
          .spec()
          .post("auth/signup")
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe("Login", () => {
      it("should login", () => {
        const dto: LoginDto = {
          email: "donmode4u@gmail.com",
          password: "123",
        };

        return pactum
          .spec()
          .post("auth/login")
          .withBody(dto)
          .expectStatus(200)
          .stores("userAt", "access_token");
      });
    });
  });

  describe("User", () => {
    describe("Get Me", () => {
      it("should get currently logged in user's profile", () => {
        return pactum
          .spec()
          .get("users/me")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(200);
      });
    });
    describe("Edit User", () => {
      it("should edit currently logged in user's detail", () => {
        const dto: EditUserDto = {
          lastname: "Tester",
        };
        return pactum
          .spec()
          .patch("users")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.lastname);
      });
    });
  });

  describe("Bookmarks", () => {
    describe("Get empty Bookmark", () => {
      it("Should get empty bookmarks", () => {
        return pactum
          .spec()
          .get("bookmarks")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe("Create Bookmark", () => {
      it("Should create empty bookmarks", () => {
        const dto: CreateBookmarkDto = {
          title: "Image",
          link: "https://www.image.com",
        };
        return pactum
          .spec()
          .post("bookmarks")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(
            "https://www.image.com",
          )
          .stores("bookmarkId", "id");
      });
    });
    describe("Get Bookmarks", () => {
      it("Should get non-empty bookmarks", () => {
        return pactum
          .spec()
          .get("bookmarks")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(200)
          .expectBodyContains(
            "https://www.image.com",
          )
          .expectJsonLength(1);
      });
    });
    describe("Get Bookmark by Id", () => {
      it("Should get a single bookmark", () => {
        return pactum
          .spec()
          .get("bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(200)
          .expectBodyContains(
            "https://www.image.com",
          );
      });
    });
    describe("Edit Bookmark by Id", () => {
      it("Should edit bookmark", () => {
        const dto: EditBookmarkDto = {
          link: "https://www.new-image.com",
        };
        return pactum
          .spec()
          .patch("bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(
            "https://www.new-image.com",
          );
      });
    });
    describe("Delete Bookmark by Id", () => {
      it("Should delete bookmark", () => {
        return pactum
          .spec()
          .delete("bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(204);
      });

      it("Should get empty bookmark", () => {
        return pactum
          .spec()
          .get("bookmarks")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
