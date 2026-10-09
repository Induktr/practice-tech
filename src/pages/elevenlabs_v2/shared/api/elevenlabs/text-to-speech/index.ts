import { FC } from "react";
import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";
import { TextToSpeechConvertRequestOutputFormat } from "@elevenlabs/elevenlabs-js/api";

export const elevenlabs = new ElevenLabsClient();

export type TextToSpeechProps = {
  client: ElevenLabsClient;
  text: string;
  modelId: string;
  outputFormat: TextToSpeechConvertRequestOutputFormat;
};

export const generateTextToSpeech: FC<TextToSpeechProps> = async ({ client, text, modelId, outputFormat }) => {
  const audio = await client.textToSpeech.convert(
    "JBFqnCBsd6RMkjVDRZzb", // "George" - browse voices at elevenlabs.io/app/voice-library
    {
      text: text,
      modelId: modelId,
      outputFormat: outputFormat,
    },
  );
};
