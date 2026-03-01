import {
  CommandsRegistry,
  registerCommand,
  runCommand,
} from "./CommandsRegistry";

import { handlerLogin, register , deleteUser,getAllUser, handlerFollowing} from "./commands.js";
import { aggHandler } from "./agg.js";
import { handlerAddFeed , handlerFeeds , handlerFollow , handlerUnfollow} from "./commands";
import { middlewareLoggedIn } from "./commands";

const registry: CommandsRegistry = {};

registerCommand(registry, "login", handlerLogin);
registerCommand(registry, "register", register);
registerCommand(registry, "reset", deleteUser);
registerCommand(registry, "users", getAllUser);
registerCommand(registry, "agg", aggHandler);
registerCommand(registry, "feeds", handlerFeeds);
registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Error: Not enough arguments provided.");
  process.exit(1);
}

async function main() {
  const [cmdName, ...cmdArgs] = args;

  try {
    await runCommand(registry, cmdName, ...cmdArgs);
    process.exit(0); 
  } catch (err: any) {
    console.error("Error:", err.message);
    process.exit(1); 
  }
}

main();