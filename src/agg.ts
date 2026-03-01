import type { CommandHandler } from "./commands.js";
import { fetchFeed } from "./lib/fetchFeed.js";

export const aggHandler: CommandHandler = async () => {
  const feed = await fetchFeed(
    "https://www.wagslane.dev/index.xml"
  );

  console.log(JSON.stringify(feed, null, 2));
};