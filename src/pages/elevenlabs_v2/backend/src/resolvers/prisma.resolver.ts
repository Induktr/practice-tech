import { Query, Resolver } from "@nestjs/graphql";
import { PrismaClient } from "../../../prisma/generated/client";
import { VoiceSchema, ProjectSchema, TextSchema, AudioSchema } from "../schemas/media";
import { createZodDto } from "nestjs-zod";

@Resolver()
export class PrismaResolver {
  constructor(private readonly prisma: PrismaClient) {}

  @Query(() => String)
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return "OK";
  }

  @Query(() => createZodDto(VoiceSchema))
  async fetchVoices() {
    return this.prisma.voice.findMany();
  }

  @Query(() => createZodDto(ProjectSchema))
  async fetchProjects() {
    return this.prisma.project.findMany();
  }

  @Query(() => createZodDto(TextSchema))
  async fetchTexts() {
    return this.prisma.text.findMany();
  }

  @Query(() => createZodDto(AudioSchema))
  async fetchAudios() {
    return this.prisma.audio.findMany();
  }
}
