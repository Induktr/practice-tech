export type ImgProps = {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type TemplateCard = {
  id: number;
  title: string;
  description: string;
  category?: string;
  img: ImgProps;
};

export type RecentCard = {
  id: number;
  title: string;
  type: "Sound Effects" | "Text to Speech" | string;
  timestamp: string;
  img?: ImgProps;
};

export type CardProps<T = string | number | ImgProps> = {
  template: {
    cards: TemplateCard[];
  };
  recent: {
    cards: RecentCard[];
  };
};

export const CARD_DATA: CardProps<string | number | ImgProps> = {
  template: {
    cards: [
      {
        id: 1,
        title: "Create UGC videos",
        description: "Turn a product photo into a UGC video",
        category: "Video",
        img: {
          src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
          alt: "Create UGC videos thumbnail",
        },
      },
      {
        id: 2,
        title: "Explainer video",
        description: "Create short explainer videos from text",
        category: "Video",
        img: {
          src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
          alt: "Explainer video cosmic galaxy",
        },
      },
      {
        id: 3,
        title: "Song from lyrics",
        description: "Turn your lyrics into a finished song.",
        category: "Music",
        img: {
          src: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&auto=format&fit=crop&q=80",
          alt: "Singing into microphone",
        },
      },
      {
        id: 4,
        title: "Compare voices",
        description: "Drop in your voice-over script, select voices and compare",
        category: "Speech",
        img: {
          src: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80",
          alt: "Podcast studio compare voices",
        },
      },
      {
        id: 5,
        title: "Product scene variation",
        description: "Upload your product shot or ad and generate variations",
        category: "Image",
        img: {
          src: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80",
          alt: "Product bottle variations",
        },
      },
      {
        id: 6,
        title: "Selfie to character sheet",
        description: "Describe your character and get 6 realistic angles",
        category: "Image",
        img: {
          src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
          alt: "Selfie to character sheet",
        },
      },
      {
        id: 7,
        title: "Product hero shots",
        description: "Product photo to 9 x product hero shots in seconds",
        category: "Image",
        img: {
          src: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
          alt: "Product hero shots handbag",
        },
      },
      {
        id: 8,
        title: "Enhance artificial skin",
        description: "Refines skin texture in AI generation for realism",
        category: "Image",
        img: {
          src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
          alt: "Enhance artificial skin portrait",
        },
      },
    ],
  },
  recent: {
    cards: [
      {
        id: 1,
        title: "4-note ascending cyber chime sound",
        type: "Sound Effects",
        timestamp: "3 weeks ago",
        img: {
          src: "",
          alt: "Sound effect cyber chime",
        },
      },
      {
        id: 2,
        title: "4-note ascending cyber chime sound effect",
        type: "Sound Effects",
        timestamp: "3 weeks ago",
        img: {
          src: "",
          alt: "Sound effect cyber chime variant",
        },
      },
      {
        id: 3,
        title: "It all started when I first got into creative writing...",
        type: "Text to Speech",
        timestamp: "2 months ago",
        img: {
          src: "",
          alt: "Text to speech generation",
        },
      },
      {
        id: 4,
        title: "Всё началось с того, что сначала мы экспериментировали...",
        type: "Text to Speech",
        timestamp: "2 months ago",
        img: {
          src: "",
          alt: "Russian text to speech",
        },
      },
      {
        id: 5,
        title: "Қайырлы күн, баршаңызға, және бүгінгі подкастқа...",
        type: "Text to Speech",
        timestamp: "2 months ago",
        img: {
          src: "",
          alt: "Kazakh voiceover generation",
        },
      },
      {
        id: 6,
        title: "...مرحبا، وشكرا لك يا ماتفيي على دعوتي إلى هذا اللقاء",
        type: "Text to Speech",
        timestamp: "2 months ago",
        img: {
          src: "",
          alt: "Arabic voice generation",
        },
      },
      {
        id: 7,
        title: "Good afternoon, everyone, and thank you for joining us...",
        type: "Text to Speech",
        timestamp: "2 months ago",
        img: {
          src: "",
          alt: "English voiceover meeting",
        },
      },
      {
        id: 8,
        title: "Всем добрый день, и спасибо тебе огромное за приглашение...",
        type: "Text to Speech",
        timestamp: "2 months ago",
        img: {
          src: "",
          alt: "Russian speech generation",
        },
      },
      {
        id: 9,
        title: "Мысалы, спорт сияқты хоббилеріңіз бар ма, бос уақытта...",
        type: "Text to Speech",
        timestamp: "2 months ago",
        img: {
          src: "",
          alt: "Multilingual speech synthesis",
        },
      },
      {
        id: 10,
        title: "Хобби, например, как спорт, когда есть свободное время...",
        type: "Text to Speech",
        timestamp: "2 months ago",
        img: {
          src: "",
          alt: "Voiceover project",
        },
      },
      {
        id: 11,
        title: "Hobbies, like sports, for example, when having free time...",
        type: "Text to Speech",
        timestamp: "2 months ago",
        img: {
          src: "",
          alt: "Voiceover translation",
        },
      },
      {
        id: 12,
        title: "...على سبيل المثال، مثل الرياضة، عندما أقوم بممارسة التمارين",
        type: "Text to Speech",
        timestamp: "2 months ago",
        img: {
          src: "",
          alt: "Arabic voice clip",
        },
      },
    ],
  },
} as const;

export const STUDIO_TABS = [
  { id: "speech", label: "Speech" },
  { id: "image", label: "Image" },
  { id: "video", label: "Video" },
  { id: "sound-effects", label: "Sound Effects" },
  { id: "music", label: "Music" },
  { id: "voice-changer", label: "Voice Changer" },
  { id: "voice-isolator", label: "Voice Isolator" },
  { id: "upscale", label: "Upscale" },
  { id: "more-tools", label: "More Tools" },
] as const;

export const PROMPT_SUGGESTIONS = [
  { id: 1, label: "Narrate a story" },
  { id: 2, label: "Tell a joke" },
  { id: 3, label: "Record an ad" },
  { id: 4, label: "Guide a meditation" },
] as const;

export const BANNER_FEATURES = [
  "Inpainting",
  "Long-form composition",
  "Fast rap and complex vocals",
  "Genre transitions",
  "Improved quality",
] as const;

export type StudioControl = {
  id: string;
  label: string;
  variant: "ghost" | "default" | "secondary" | "outline";
  icon?: "arrow-right" | "arrow-up";
  tooltip?: string;
  align?: "left" | "right";
  avatar?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

export const STUDIO_CONTROLS: StudioControl[] = [
  {
    id: "model",
    label: "Eleven Multilingual v2",
    variant: "ghost",
    tooltip: "Select voice generation model",
  },
  {
    id: "voice",
    label: "Nikita Voitenko",
    variant: "ghost",
    tooltip: "Change speaker voice",
    avatar: {
      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      alt: "Nikita Voitenko",
      width: 20,
      height: 20,
    },
  },
  {
    id: "options",
    label: "More Options",
    variant: "ghost",
    icon: "arrow-right",
    tooltip: "Stability, clarity, and style exaggeration",
  },
  {
    id: "generate",
    label: "Generate",
    variant: "default",
    icon: "arrow-up",
    tooltip: "Generate speech from prompt (⌘+Enter)",
    align: "right",
  },
];

export const MUSIC_BANNER_EXAMPLES = [
  {
    id: 1,
    title: "Nu-Disco",
    src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
    alt: "Nu-Disco music genre",
  },
  {
    id: 2,
    title: "Synthwave",
    src: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80",
    alt: "Synthwave track artwork",
  },
  {
    id: 3,
    title: "Cinematic",
    src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
    alt: "Cinematic score artwork",
  },
  {
    id: 4,
    title: "Lo-Fi Beats",
    src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
    alt: "Lo-Fi beats artwork",
  },
  {
    id: 5,
    title: "Electronic",
    src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop&q=80",
    alt: "Electronic music artwork",
  },
] as const;
