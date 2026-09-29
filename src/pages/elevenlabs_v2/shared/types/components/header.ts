import z from "zod";
import { HeaderPropsSchema } from "@/shared/schemas/components/header_schema";

export type HeaderProps = z.infer<typeof HeaderPropsSchema>;

