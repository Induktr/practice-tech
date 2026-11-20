import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function main() {
  console.log("Starting seed...");

  // create new voice on ElevenLabs API
  const voices = await Promise.all([
    prisma.voice.create({
      data: {
        id: "",
        name: "Test Voice",
        modelId: "eleven_multilingual_v2",
        description: "Test Voice",
        stability: 0.5,
        similarityBoost: 0.5,
        permissions: [],
        category: "",
        fineTuningRequest: "",
        publicDomain: false,
      },
    }),
    prisma.project.create({
      data: {
        id: "",
        name: "Test Project",
        description: "Test Project",
        stability: 0.5,
        similarityBoost: 0.5,
        permissions: [],
        category: "",
        fineTuningRequest: "",
        publicDomain: false,
      },
    }),
    prisma.text.create({
      data: {
        id: "",
        name: "Test Text",
        description: "Test Text",
        stability: 0.5,
        similarityBoost: 0.5,
        permissions: [],
        category: "",
        fineTuningRequest: "",
        publicDomain: false,
      },
    }),
    prisma.audio.create({
      data: {
        id: "",
        name: "Test Audio",
        description: "Test Audio",
        stability: 0.5,
        similarityBoost: 0.5,
        permissions: [],
        category: "",
        fineTuningRequest: "",
        publicDomain: false,
      },
    }),
  ]);

  const filteredVoice = voices.filter((voice) => voice.name === "Test Voice");

  console.log(`Test records created successfully: ${filteredVoice.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
