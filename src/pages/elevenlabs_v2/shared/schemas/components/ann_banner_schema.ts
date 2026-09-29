import { DetailsHTMLAttributes } from "react";
import z from "zod";

export const AnnBannerSchema = z.object<DetailsHTMLAttributes<Omit<HTMLDivElement, "children">>>({});
