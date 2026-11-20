import * as v from "valibot";

export const HeaderConfigSchema = v.object({
  title: v.optional(v.string()),
  showSearch: v.optional(v.boolean()),
});

export type HeaderConfig = v.InferOutput<typeof HeaderConfigSchema>;
