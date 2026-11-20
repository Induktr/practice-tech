import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";
import { TextToSpeechConvertRequestOutputFormat } from "@elevenlabs/elevenlabs-js/api";

export const elevenlabs = new ElevenLabsClient();

export type TextToSpeechProps = {
  client: ElevenLabsClient;
  text: string;
  modelId: string;
  outputFormat: TextToSpeechConvertRequestOutputFormat;
};

export async function generateTextToSpeech(props: TextToSpeechProps) {
  const audio = await Promise.try(
    async () =>
      await props.client.textToSpeech.convert(
        "JBFqnCBsd6RMkjVDRZzb", // "George" - browse voices at elevenlabs.io/app/voice-library
        {
          text: props.text,
          modelId: props.modelId,
          outputFormat: props.outputFormat,
        },
      ),
  );
  return audio;
}

// TODO: Check it option text-to-image and image-to-image and video-to-video.

export async function generateImageToImage(props: TextToSpeechProps) {
  const audio = await Promise.try(
    async () =>
      await props.client.textToSpeech.convert(
        "JBFqnCBsd6RMkjVDRZzb", // "George" - browse voices at elevenlabs.io/app/voice-library
        {
          text: props.text,
          modelId: props.modelId,
          outputFormat: props.outputFormat,
        },
      ),
  );
  return audio;
}
