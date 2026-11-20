import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import * as z from "zod";
import {
  generateTextToSpeech,
  generateImageToImage,
  generateVideoToVideo,
} from "../api/elevenlabs/text-to-speech";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Create basicly type for media content and so on.

export const CategoryMediaSchema = z.enum(["text-to-speech", "image-to-image", "video-to-video"]);

export type TCategoryMedia = z.infer<typeof CategoryMediaSchema>;

export const GENERATE_MEDIA = gql`
  mutation GenerateMedia($input: GenerateMediaInput!) {
    generateMedia(input: $input) {
      id
      name
      description
      language
      category
      previewUrl
    }
  }
`;

export const useGenerateMedia = (type: TCategoryMedia) => {
  const [generateMedia, { data, loading, error }] = useMutation(GENERATE_MEDIA);

  switch (type) {
    case "text-to-speech":
      return generateTextToSpeech({
        client: new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! }),
        text: data?.generateMedia as string,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_192",
      });
    case "image-to-image":
      return generateImageToImage({
        client: new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! }),
        text: data?.generateMedia as string,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_192",
      });
    case "video-to-video":
      return generateVideoToVideo({
        client: new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! }),
        text: data?.generateMedia as string,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_192",
      });
    default:
      return null;
  }
};
