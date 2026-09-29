import z from "zod";

import { AnnBannerSchema } from "@/shared/schemas/components/ann_banner_schema";

export type AnnBannerProps = z.infer<typeof AnnBannerSchema>;