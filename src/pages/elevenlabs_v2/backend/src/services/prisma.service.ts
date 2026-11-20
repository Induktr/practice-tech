import { Injectable } from "@nestjs/common";
import { PrismaClient } from "../../../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaResolver } from "../resolvers/prisma.resolver";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly prismaResolver: PrismaResolver) {
    super({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async health() {
    return this.prismaResolver.health();
  }

  async fetchVoices() {
    return this.prismaResolver.fetchVoices();
  }

  async fetchProjects() {
    return this.prismaResolver.fetchProjects();
  }

  async fetchTexts() {
    return this.prismaResolver.fetchTexts();
  }

  async fetchAudios() {
    return this.prismaResolver.fetchAudios();
  }
}
