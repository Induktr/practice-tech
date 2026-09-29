import { DetailsHTMLAttributes } from "react";
import z from "zod";

export const HeaderPropsSchema = z.object<DetailsHTMLAttributes<Omit<HTMLDivElement, "children">>>({});