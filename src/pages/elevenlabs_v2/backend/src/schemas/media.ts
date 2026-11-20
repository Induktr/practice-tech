import z from "zod";

export const VoiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  stability: z.number(),
  similarityBoost: z.number(),
  permissions: z.array(z.string()),
  category: z.string(),
  fineTuningRequest: z.string(),
  publicDomain: z.boolean(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  stability: z.number(),
  similarityBoost: z.number(),
  permissions: z.array(z.string()),
  category: z.string(),
  fineTuningRequest: z.string(),
  publicDomain: z.boolean(),
});

export const TextSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  stability: z.number(),
  similarityBoost: z.number(),
  permissions: z.array(z.string()),
  category: z.string(),
  fineTuningRequest: z.string(),
  publicDomain: z.boolean(),
});

export const AudioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  stability: z.number(),
  similarityBoost: z.number(),
  permissions: z.array(z.string()),
  category: z.string(),
  fineTuningRequest: z.string(),
  publicDomain: z.boolean(),
});
