import { ModuleType } from "@packages/shared/schemas";
import { z } from "zod";

export const typeFilterSchema = z.object({
    type: z.nativeEnum(ModuleType).optional(),
  });
  export type typeFilter = z.infer<typeof typeFilterSchema>;
  