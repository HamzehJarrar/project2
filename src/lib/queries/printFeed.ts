import { Feed } from "../feeds";
import { users } from "../schema";

export function printFeed(feed: Feed, user: users) {
  console.log("Feed ID:", feed.id);
  console.log("Feed Name:", feed.name);
  console.log("Feed URL:", feed.url);
  console.log("Created At:", feed.createdAt);
  console.log("User:", user.name);
}