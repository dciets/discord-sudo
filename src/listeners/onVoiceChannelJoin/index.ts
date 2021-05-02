import { VoiceState } from "discord.js";
import jesus from "./jesus";
import zergov from "./zergov";
import emilio from "./emilio";

export default (oldState: VoiceState, newState: VoiceState) => {
    jesus(oldState, newState);
	zergov(oldState, newState);
	emilio(oldState, newState);
};
