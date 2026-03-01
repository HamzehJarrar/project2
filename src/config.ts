import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName?: string;
};

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

export function writeConfig(cfg: Config): void {
  const json = JSON.stringify(
    {
      db_url: cfg.dbUrl,
      current_user_name: cfg.currentUserName || null,
    },
    null,
    2
  );
  fs.writeFileSync(getConfigFilePath(), json, "utf-8");
}

function validateConfig(raw: any): Config {
  if (!raw || typeof raw !== "object") throw new Error("Invalid config file");
  if (typeof raw.db_url !== "string") throw new Error("Missing db_url");
  return {
    dbUrl: raw.db_url,
    currentUserName: raw.current_user_name || undefined,
  };
}

export function readConfig(): Config {
  const filePath = getConfigFilePath();
  if (!fs.existsSync(filePath)) {
    const defaultConfig: Config = { dbUrl: "postgres://example" };
    writeConfig(defaultConfig);
    return defaultConfig;
  }
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return validateConfig(raw);
}

export function setUser(username: string): void {
  const cfg = readConfig();
  cfg.currentUserName = username;
  writeConfig(cfg); 
}