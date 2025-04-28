import { z } from "zod";

export const dhis2IdSchema = z.string().regex(/^[0-9a-zA-Z]{11}$/);
