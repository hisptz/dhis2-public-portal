import { config } from "dotenv";
import { envSchema } from "./schema";

export * from "./schema";

config();

export const env = envSchema.parse(process.env);
