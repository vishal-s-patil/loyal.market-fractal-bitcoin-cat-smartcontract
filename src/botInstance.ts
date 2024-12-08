import { Bot } from "grammy";

export class TgBot {
  private static instance: TgBot | null = null;
  private bot: Bot;

  private constructor() {
    const token: string = process.env.BOT_API_TOKEN || "";

    this.bot = new Bot(token);
  }

  public static getInstance(): TgBot {
    if (!TgBot.instance) {
      TgBot.instance = new TgBot();
    }
    return TgBot.instance;
  }

  public getBot(): Bot {
    return this.bot;
  }
}
