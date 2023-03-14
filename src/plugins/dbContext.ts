import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";

export type IDbContext = PrismaClient;

declare module "fastify" {
  interface FastifyInstance {
    dbContext: IDbContext;
  }
}

export default fp(async function (app) {
  const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });
  await prisma.$connect();

  app.decorate("dbContext", prisma);

  app.addHook("onClose", async s => {
    await s.dbContext.$disconnect();
  });
});
