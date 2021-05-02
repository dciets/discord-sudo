import { VoiceState } from "discord.js";
import introSounds from "./introSounds";

export default (oldState: VoiceState, newState: VoiceState) => {
  introSounds(oldState, newState);
};
