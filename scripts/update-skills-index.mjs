#!/usr/bin/env node
// Regenerates public/.well-known/agent-skills/index.json so each skill's
// `digest` field matches the current SHA-256 of its SKILL.md artifact.
//
// Run automatically via `npm run prebuild`.

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const INDEX_PATH = resolve(
  ROOT,
  "public/.well-known/agent-skills/index.json",
);
const SITE_ORIGIN = "https://lucataco.com";

async function sha256(path) {
  const buf = await readFile(path);
  return createHash("sha256").update(buf).digest("hex");
}

function urlToLocalPath(url) {
  if (!url.startsWith(SITE_ORIGIN + "/")) {
    throw new Error(
      `Skill url must start with ${SITE_ORIGIN}/ — got: ${url}`,
    );
  }
  const relative = url.slice(SITE_ORIGIN.length + 1);
  return resolve(ROOT, "public", relative);
}

async function main() {
  const raw = await readFile(INDEX_PATH, "utf8");
  const index = JSON.parse(raw);

  if (!Array.isArray(index.skills)) {
    throw new Error("index.json is missing a `skills` array");
  }

  let changed = false;
  for (const skill of index.skills) {
    if (skill.type !== "skill-md") continue;
    const localPath = urlToLocalPath(skill.url);
    const hex = await sha256(localPath);
    const digest = `sha256:${hex}`;
    if (skill.digest !== digest) {
      console.log(
        `[skills-index] ${skill.name}: digest ${skill.digest} -> ${digest}`,
      );
      skill.digest = digest;
      changed = true;
    }
  }

  if (changed) {
    await writeFile(INDEX_PATH, JSON.stringify(index, null, 2) + "\n");
    console.log("[skills-index] index.json updated");
  } else {
    console.log("[skills-index] all digests already up to date");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
