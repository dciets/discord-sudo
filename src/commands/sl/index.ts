import DiscordJS from "discord.js";

import Command from "../command";

const sl = `
\`\`\`                      (@@) (  ) (@)  ( )  @@    ()    @     O     @     O      @
                 (   )
             (@@@@)
          (    )
  
        (@@@)
       ====        ________                ___________
   _D _|  |_______/        \__I_I_____===__|_________|
    |(_)---  |   H\________/ |   |        =|___ ___|      _________________
    /     |  |   H  |  |     |   |         ||_| |_||     _|                \_____A
   |      |  |   H  |__--------------------| [___] |   =|                        |
   | ________|___H__/__|_____/[][]~\_______|       |   -|                        |
   |/ |   |-----------I_____I [][] []  D   |=======|____|________________________|_
 __/ =| o |=-~~\  /~~\  /~~\  /~~\ ____Y___________|__|__________________________|_
  |/-=|___|=   O=====O=====O=====O|_____/~\___/          |_D__D__D_|  |_D__D__D_|
   \_/      \__/  \__/  \__/  \__/      \_/               \_/   \_/    \_/   \_/\`\`\``;

class SteamLocomotive extends Command {
  constructor() {
    super(["sl"]);
  }

  public async execute(message: DiscordJS.Message, ...args: string[]) {
    return message.channel.send(sl);
  }
}

export default new SteamLocomotive();
