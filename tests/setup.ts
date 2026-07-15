// Vitest setup — env vars + global mocks live here.
(process.env as { NODE_ENV?: string }).NODE_ENV = "test";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://flower:flower@localhost:5432/flower_shop_test?schema=public";
