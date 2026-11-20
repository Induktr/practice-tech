import * as v from "valibot";

export const AnnBannerConfigSchema = v.object({
  features: v.optional(v.array(v.string())),
  tag: v.optional(v.string()),
});

export type AnnBannerConfig = v.InferOutput<typeof AnnBannerConfigSchema>;
