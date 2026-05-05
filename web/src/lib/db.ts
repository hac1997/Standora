import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

// Prisma 7 requires a driver adapter for SQLite.
// PrismaBetterSqlite3 takes a config object with `url`, NOT a Database instance.
// The adapter manages the better-sqlite3 connection internally.
// In dev, we never cache in globalThis to avoid hot-reload private-field corruption.

function createPrismaClient(): PrismaClient {
  const dbPath = path.resolve(process.cwd(), "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  process.env.NODE_ENV === "production"
    ? (global._prisma ?? (global._prisma = createPrismaClient()))
    : createPrismaClient();
