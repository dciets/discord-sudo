import DiscordJS from "discord.js";

interface ICommand {
  execute(message: DiscordJS.Message, ...args: string[]): Promise<any>;
}

export default ICommand;
