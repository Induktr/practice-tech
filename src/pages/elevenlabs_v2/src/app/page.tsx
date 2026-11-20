import Image from "next/image";
import { Header } from "@/widgets/Header/Header";
import { Button } from "@/shared/ui/button";
import {
  Sidebar,
  Search,
  MessageCircleMore,
  Folder,
  Bell,
  Plus,
  Mic,
  ArrowUp,
  Music2,
} from "lucide-react";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

import * as z from "zod";
import { Badge } from "../shared/ui/badge";
import { AnnBanner } from "../widgets/Banner/AnnBanner";
import { generateTextToSpeech } from "../shared/api/elevenlabs/text-to-speech";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { TCategoryMedia, useGenerateMedia } from "../shared/hooks/useGenerateMedia";
import { useState } from "react";

export const ProjectSchema = z.object({
  id: z.string("ID обязателен к заполнению"),
  name: z.string("Название обязательно к заполнению"),
  description: z.string("Описание обязательно к заполнению"),
  language: z.string("Язык обязателен к заполнению"),
  category: z.string("Категория обязательна к заполнению"),
  previewUrl: z.url("Ссылка на превью обязательна к заполнению"),
});

export type TProject = z.infer<typeof ProjectSchema>;

const GET_PROJECTS = gql`
  query FetchProjects {
    fetchProjects {
      id
      name
      description
      language
      category
      previewUrl
    }
  }
`;

export default function Home() {
  const { data, loading, error } = useQuery(GET_PROJECTS);
  const [typeMedia, setTypeMedia] = useState<TCategoryMedia>("text-to-speech");
  const generateMedia = useGenerateMedia(typeMedia);

  if (loading || !data?.fetchProjects) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-white font-medium">Loading...</p>
      </div>
    );
  }

  const { fetchProjects } = data as { fetchProjects: TProject[] };
  const template = fetchProjects.filter((project: TProject) => project.category === "template");
  const recent = fetchProjects.filter((project: TProject) => project.category === "recent");

  return (
    <>
      <Header className="w-auto h-12.5">
        <div className="w-full h-12.5 flex fixed flex-row justify-between items-center border-b border-(--border-default) bg-(--bg-canvas) z-10 px-3">
          <div className="flex justify-start flex-row items-center w-full">
            <Button
              className="flex flex-row cursor-e-resize text-(--text-tertiary)"
              variant="ghost"
            >
              <Sidebar width="20" height="20" />
            </Button>
            <div className="flex flex-1 flex-row justify-start">
              <p className="text-sm text-white font-medium truncate">Home</p>
            </div>
          </div>
          <Button
            className="flex flex-row justify-between items-center max-w-65 w-full rounded-[12px]"
            variant="outline"
          >
            <span className="flex flex-row items-center gap-2 text-(--text-tertiary)">
              <Search width="18" height="18" />
              <span className="">Search everything...</span>
            </span>
            <div className="flex flex-row gap-2 text-(--text-tertiary) pointer-events-none">
              <Button className="w-1 h-6 rounded-[5px]" variant="outline">
                <span>⌘</span>
              </Button>
              <Button className="w-1 h-6 rounded-[5px]" variant="outline">
                <span>K</span>
              </Button>
            </div>
          </Button>
          <div className="flex flex-row justify-end items-center w-full">
            <div className="flex flex-1 flex-row justify-end items-center w-full gap-2">
              <Button variant="outline">Feedback</Button>
              <Button variant="outline">Docs</Button>
              <Button variant="outline">
                <MessageCircleMore width="18" height="18" />
                Ask
              </Button>
              <Button variant="outline">
                <Folder width="18" height="18" />
              </Button>
              <Button variant="outline">
                <Bell width="18" height="18" />
              </Button>
              <Button className="h-auto rounded-full w-auto p-0 m-0" variant="outline">
                <Image
                  className="rounded-full outline-4 outline-(--border-default) ring-transparent outline-(--border-default) object-cover"
                  src="/assets/images/founders/induktr_avatar.jpg"
                  alt="User Avatar"
                  width={30}
                  height={30}
                />
              </Button>
            </div>
          </div>
        </div>
      </Header>
      <main className="relative w-full">
        <section className="p-10 w-full max-w-380 mx-auto">
          <div className="">
            <div className="flex flex-col justify-center items-center h-auto">
              <article className="relative flex w-full max-w-162.5 max-h-13">
                <div className="bg-muted w-full rounded-4xl">
                  <div className="h-auto">
                    <div className="flex flex-row justify-center items-center">
                      <div className="flex flex-row justify-center h-auto ml-5 my-auto mx-auto">
                        <Music2 className="text-destructive cursor-text" />
                      </div>
                      <Button className="bg-transparent text-foreground hover:bg-muted max-h-full">
                        <Plus />
                      </Button>
                      <Input
                        className="border-none focus-visible:ring-transparent text-[24px] h-auto p-0 py-3.75"
                        type="text"
                        placeholder="Design a social media video..."
                      />
                      <Badge variant="secondary">Alpha</Badge>
                      <Button variant="ghost">
                        <Mic />
                      </Button>
                      <Button variant="default">
                        <ArrowUp />
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <AnnBanner className="flex flex-row justify-center items-center p-7 w-full">
            <div className="flex h-auto max-w-20 overflow-hidden">
              <div className="flex flex-row items-center space-y-3 gap-3">
                <p>Featured</p>
              </div>
            </div>
            <div className="flex flex-col">
              <p>Try Music</p>
              <span className="">V2</span>
              <div className="space-y-3 max-h-20 overflow-y-hidden">
                <Image src="" alt="" width={100} height={100} />
              </div>
            </div>
          </AnnBanner>
          <article className="">
            <h2>Templates</h2>
            <div className="">
              {template.map((project: TProject) => (
                <Card className="" key={project.id}>
                  <Image src={project.previewUrl} alt={project.name} width={200} height={200} />
                  <span>{project.name}</span>
                  <span>{project.description}</span>
                </Card>
              ))}
            </div>
          </article>
          <article className="">
            <h2>Recents</h2>
            <div className="">
              {recent.map((project: TProject) => (
                <Card className="" key={project.id}>
                  <Image src={project.previewUrl} alt={project.name} width={200} height={200} />
                  <span>{project.name}</span>
                  <span>{project.description}</span>
                </Card>
              ))}
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
