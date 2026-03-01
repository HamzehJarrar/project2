import { setUser } from "./config";
import {
  createUser,
  getUser,
  deleteUsers,
  getAllUsers,
} from "./lib/queries/users";
import { readConfig, writeConfig } from "./config";
import { fetchFeed } from "./lib/fetchFeed";
import {
  createFeed,
  createFeedFollow,
  getAllFeeds,
  getFeedByUrl,
  getFeedFollowsForUser,
} from "./lib/queries/feeds";
import { printFeed } from "./lib/queries/printFeed";

export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;

export const handlerLogin: CommandHandler = async (cmdName, ...args) => {
  if (args.length < 1) {
    throw new Error("Username is required for login");
  }

  const username = args[0];
  setUser(username);

  console.log(`Current user set to: ${username}`);
};

export const register: CommandHandler = async (cmdName, ...args) => {
  const name = args[0];
  if (!name) {
    throw new Error("Username is required for registration");
  }

  const existingUser = await getUser(name);
  if (existingUser) {
    throw new Error("Username already exists");
  }

  const user = await createUser(name);
  setUser(name); // ← هذا يكفي لتسجيل الدخول تلقائيًا
  console.log(`User created: ${name}`);
  console.log(user);
};

export const deleteUser: CommandHandler = async (cmdName, ...args) => {
  try {
    await deleteUsers();
  } catch (error) {
    throw new Error("Failed to delete users");
  }
};

export const getAllUser: CommandHandler = async (cmdName, ...args) => {
  const allUsers = await getAllUsers();
  const config = readConfig();
  const currentUser = config.currentUserName;

  try {
    const users = await getAllUsers();
    users.forEach((user) => {
      if (user.name === currentUser) {
        console.log(`* ${user.name} (current)`);
      } else {
        console.log(`* ${user.name}`);
      }
    });
  } catch (error) {
    throw new Error("Failed to get all users");
  }
};

export const aggCommand = {
  name: "agg",

  async run(): Promise<void> {
    try {
      const feed = await fetchFeed("https://www.wagslane.dev/index.xml");

      console.log(JSON.stringify(feed, null, 2));
    } catch (err) {
      console.error("Failed to aggregate feed:", err);
    }
  },
};

export async function handlerAddFeed(cmdName: string, ...args: string[]) {
  if (args.length !== 2) {
    throw new Error(`usage: ${cmdName} <feed_name> <url>`);
  }

  const config = readConfig();
  const currentUserName = config.currentUserName;
  if (!currentUserName) {
    throw new Error("No logged in user in config");
  }

  const user = await getUser(currentUserName);

  if (!user) {
    throw new Error(`User ${config.currentUserName} not found`);
  }

  const feedName = args[0];
  const url = args[1];

  const feed = await createFeed(feedName, url, user.id);

  if (!feed) {
    throw new Error(`Failed to create feed`);
  }

  await createFeedFollow(user.id, feed.id);
  console.log("Feed created successfully:");
  printFeed(feed, user);
}

export async function handlerFeeds() {
  const feeds = await getAllFeeds();
  feeds.forEach((feed) => {
    console.log(
      `Feed: ${feed.feedName}, URL: ${feed.feedUrl}, User: ${feed.userName}`,
    );
  });
}

export const handlerFollow: CommandHandler = async (cmdName, ...args) => {
  if (args.length < 1) throw new Error("Usage: follow <url>");

  const config = readConfig();
  if (!config.currentUserName) throw new Error("Login required");

  const user = await getUser(config.currentUserName);
  const feed = await getFeedByUrl(args[0]);

  if (!user || !feed) throw new Error("User or Feed not found");

  const follow = await createFeedFollow(user.id, feed.id);
  console.log(
    `User '${follow.userName}' is now following '${follow.feedName}'`,
  );
};

export const handlerFollowing: CommandHandler = async (cmdName, ...args) => {
  const config = readConfig();
  const user = await getUser(config.currentUserName!);
  if (!user) throw new Error("User not found");

  const follows = await getFeedFollowsForUser(user.id);
  console.log(`User ${user.name} follows:`);
  follows.forEach((f) => console.log(`* ${f.feedName}`));
};
