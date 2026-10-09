import * as v from "valibot";
import Image from "next/image";
import { Header } from "@/widgets/Header/Header";
import { Button } from "@/shared/ui/button";
import {
  Sidebar,
  Search,
  MessageCircleMore,
  Folder,
  Bell,
  ArrowRight,
  ArrowUp
} from "lucide-react";
import { AnnBanner } from "@/widgets/Banner/AnnBanner";
import { Card } from "@/shared/ui/card";
import {
  CARD_DATA,
  STUDIO_TABS,
  PROMPT_SUGGESTIONS,
  BANNER_FEATURES,
  STUDIO_CONTROLS,
  MUSIC_BANNER_EXAMPLES,
} from "@/shared/constants/services/data";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";

type InputGeneration = {
  generateId: "sound" | "image" | "tts";
  prompt: string;
  optoins: Record<string, string>;
};

export const InputGenerationSchema = v.object({
  generateId: v.enum({}),
  prompt: v.string(),
  options: v.record(v.string(), v.string())
});

export default function Home() {
  return (
    <>
      <Header className="w-auto h-12.5">
        <div className="w-full h-12.5 flex fixed flex-row justify-between items-center border-b border-(--border-default) bg-(--bg-canvas) z-10 px-3">
        <div className="flex justify-start flex-row items-center w-full">
          <Button className="flex flex-row cursor-e-resize text-(--text-tertiary)" variant="ghost">
            <Sidebar width="20" height="20" />
          </Button>
          <div className="flex flex-1 flex-row justify-start">
            <p className="text-sm text-white font-medium truncate">Home</p>
          </div>
        </div>
        <Button className="flex flex-row justify-between items-center max-w-65 w-full rounded-[12px]" variant="outline">
          <span className="flex flex-row items-center gap-2 text-(--text-tertiary)">
            <Search width="18" height="18"/>
            <span className="">Search everything...</span>
          </span>
          <div className="flex flex-row gap-2 text-(--text-tertiary) pointer-events-none">
            <Button className="w-1 h-6 rounded-[5px]" variant="outline">
              <span >⌘</span>
            </Button>
            <Button className="w-1 h-6 rounded-[5px]" variant="outline">
              <span>K</span>
            </Button>
          </div>
        </Button>
        <div className="flex flex-row justify-end items-center w-full">
          <div className="flex flex-1 flex-row justify-end items-center w-full gap-2">
            <Button variant="outline">
              Feedback
            </Button>
            <Button variant="outline">
              Docs
            </Button>
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
              <Image className="rounded-full outline-4 outline-(--border-default) ring-transparent outline-(--border-default) object-cover" src="/assets/images/founders/induktr_avatar.jpg" alt="User Avatar" width={30} height={30} />
            </Button>
          </div>
        </div>
        </div>
      </Header>
      <main className="relative w-full">
        <section className="p-10 w-full max-w-380 mx-auto">
          <div className="">
            <div className="">
              <article className="relative">
                <div className="bg-(--border-hover) p-2 w-full rounded-4xl">
                  <div className="">
                    <div className="">
                      <div className="">
                        {STUDIO_TABS.map((tab) => (
                          <Button className="rounded-xl" key={tab.id} variant="ghost">
                            {tab.label}
                          </Button>
                        ))}
                        <Textarea className="min-h-64 max-h-64" placeholder="Start typing or paste text..." maxLength={450}></Textarea>
                        <div className="flex flex-row gap-2 space-y-2">
                          {PROMPT_SUGGESTIONS.map((prompt) => (
                            <Button key={prompt.id} className="rounded-md text-(--text-secondary) text-[12px] px-2 h-6.5 bg-(--bg-surface-muted) hover:bg-(--bg-surface-muted) border-0" variant="secondary">
                              {prompt.label}
                            </Button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 w-full">
                          {STUDIO_CONTROLS.map((control) => (
                            <Button
                              key={control.id}
                              className={cn("rounded-xl", control.align === "right" ? "ml-auto" : "")}
                              variant={control.variant}
                              tooltip={control.tooltip}
                            >
                              {control.avatar && (
                                <Image
                                  src={control.avatar.src}
                                  alt={control.avatar.alt}
                                  width={control.avatar.width}
                                  height={control.avatar.height}
                                  className="rounded-full mr-1.5"
                                />
                              )}
                              {control.label}
                              {control.icon === "arrow-right" && (
                                <ArrowRight width={20} height={20} />
                              )}
                              {control.icon === "arrow-up" && (
                                <ArrowUp width={16} height={16} />
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <AnnBanner className="flex flex-row justify-center items-center p-7 w-full">
            <div className="flex h-auto max-w-20 overflow-hidden">
              <div className="flex flex-row items-center space-y-3 gap-3">
                {BANNER_FEATURES.map((feature, index) => (
                  <p key={index}>{feature}</p>
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <h1>Try Music</h1>
              <span className="">V2</span>
              <div className="space-y-3 max-h-20 overflow-y-hidden">
                {MUSIC_BANNER_EXAMPLES.map((example) => (
                  <div key={example.id} className="">
                    <Image
                      src={example.src}
                      alt={example.alt}
                      width={100}
                      height={100}
                    />
                  </div>
                ))}
              </div>
            </div>
          </AnnBanner>
          <article className="">
            <h2>Templates</h2>
            <div className="">
              {CARD_DATA.template.cards.map((card, index) => (
                <Card className="" key={card.id || index}>
                  <Image src={card.img.src || ""} alt="Image Templates" width={200} height={200} />
                  <span>{card.title}</span>
                  <span>{card.description}</span>
                </Card>
              ))}
            </div>
          </article>
          <article className="">
            <h2>Recents</h2>
            <div className="">
              {CARD_DATA.recent.cards.map((card, index) => (
                <Card className="" key={card.id || index}>
                  <Image src={card.img?.src || ""} alt="Image Templates" width={200} height={200} />
                  <span>{card.title}</span>
                  <span>{card.timestamp}</span>
                </Card>
              ))}
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
