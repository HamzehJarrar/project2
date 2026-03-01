import { XMLParser } from "fast-xml-parser";
import type { RSSFeed, RSSItem } from "./types.js";

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch feed: ${response.status} ${response.statusText}`,
    );
  }

  const xmlText = await response.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
  });

  const parsed = parser.parse(xmlText);

  if (!parsed?.rss.channel) {
    throw new Error("Invalid RSS feed format");
  }
  const channel = parsed.rss.channel;

  const title = channel.title;
  const link = channel.link;
  const description = channel.description;

  if (!title || !link || !description) {
    throw new Error("Invalid RSS feed: missing channel metadata");
  }

  const rawItems = Array.isArray(channel.item)
    ? channel.item
    : channel.item
      ? [channel.item]
      : [];

  const items: RSSItem[] = rawItems
    .map((item: any) => {
      const itemTitle = item.title;
      const itemLink = item.link;
      const itemDescription = item.description;
      const itemPubDate = item.pubDate;

      if (!itemTitle || !itemLink || !itemDescription || !itemPubDate) {
        return null;
      }

      return {
        title: itemTitle,
        link: itemLink,
        description: itemDescription,
        pubDate: itemPubDate,
      };
    })
    .filter((item: any): item is RSSItem => item !== null);

  return {
    channel: {
      title,
      link,
      description,
      item: items,
    },
  };
}
