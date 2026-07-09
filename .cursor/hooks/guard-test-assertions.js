#!/usr/bin/env node
/**
 * afterFileEdit guard: block edits that weaken Playwright tests under tests/.
 *
 * Blocks (exit 2) when:
 *   - active expect( count drops vs pre-edit content
 *   - an expect( was commented out instead of fixed
 *
 * Allows locator-only heals and other edits that preserve assertion coverage.
 */

const fs = require("fs");
const path = require("path");

const TESTS_PATTERN = /(?:^|[\\/])tests[\\/]/;

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

function stripInlineComment(line) {
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (c === "\\") {
      escaped = true;
      continue;
    }
    if (c === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (c === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (!inSingle && !inDouble && c === "/" && line[i + 1] === "/") {
      return line.slice(0, i);
    }
  }

  return line;
}

function countActiveExpects(source) {
  let count = 0;
  let inBlock = false;

  for (const rawLine of source.split(/\r?\n/)) {
    let line = rawLine;

    if (inBlock) {
      const end = line.indexOf("*/");
      if (end === -1) {
        continue;
      }
      line = line.slice(end + 2);
      inBlock = false;
    }

    while (true) {
      const start = line.indexOf("/*");
      const end = line.indexOf("*/");
      if (start === -1) {
        break;
      }
      if (end !== -1 && end > start) {
        line = line.slice(0, start) + line.slice(end + 2);
        continue;
      }
      line = line.slice(0, start);
      inBlock = true;
      break;
    }

    if (inBlock) {
      continue;
    }

    const trimmed = line.trim();
    if (trimmed.startsWith("//")) {
      continue;
    }

    const code = stripInlineComment(line);
    const matches = code.match(/expect\(/g);
    if (matches) {
      count += matches.length;
    }
  }

  return count;
}

function reconstructBefore(content, edits) {
  let before = content;
  for (let i = edits.length - 1; i >= 0; i -= 1) {
    const { old_string: oldString, new_string: newString } = edits[i];
    if (typeof oldString !== "string" || typeof newString !== "string") {
      continue;
    }
    const index = before.indexOf(newString);
    if (index === -1) {
      throw new Error("Could not reconstruct pre-edit content from hook edits");
    }
    before =
      before.slice(0, index) + oldString + before.slice(index + newString.length);
  }
  return before;
}

function editCommentedOutExpect(edits) {
  for (const edit of edits) {
    const oldString = edit.old_string ?? "";
    const newString = edit.new_string ?? "";
    const oldActive = countActiveExpects(oldString);
    const newActive = countActiveExpects(newString);
    const oldRaw = (oldString.match(/expect\(/g) || []).length;
    const newRaw = (newString.match(/expect\(/g) || []).length;

    if (oldActive > 0 && newActive < oldActive && newRaw >= oldRaw) {
      return true;
    }
  }
  return false;
}

function deny(reason) {
  const payload = {
    permission: "deny",
    user_message: `Test assertion guard blocked this edit: ${reason}`,
    agent_message:
      `Refused to weaken test assertions. ${reason} ` +
      "Fix locators or POMs instead of deleting or commenting out expect() calls.",
  };
  process.stdout.write(`${JSON.stringify(payload)}\n`);
  process.exit(2);
}

async function main() {
  const raw = await readStdin();
  let input;

  try {
    input = JSON.parse(raw);
  } catch {
    process.stderr.write("guard-test-assertions: invalid stdin JSON\n");
    process.exit(1);
  }

  const filePath = input.file_path;
  if (!filePath || !TESTS_PATTERN.test(filePath.replace(/\\/g, "/"))) {
    process.exit(0);
  }

  if (!fs.existsSync(filePath)) {
    process.stderr.write(`guard-test-assertions: file not found: ${filePath}\n`);
    process.exit(1);
  }

  const edits = Array.isArray(input.edits) ? input.edits : [];
  if (edits.length === 0) {
    process.stderr.write("guard-test-assertions: missing edits array\n");
    process.exit(1);
  }

  const after = fs.readFileSync(filePath, "utf8");
  let before;

  try {
    before = reconstructBefore(after, edits);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }

  const beforeCount = countActiveExpects(before);
  const afterCount = countActiveExpects(after);

  if (afterCount < beforeCount) {
    deny(
      `active expect( count fell from ${beforeCount} to ${afterCount} in ${path.basename(filePath)}`,
    );
  }

  if (editCommentedOutExpect(edits)) {
    deny(`an expect( was commented out in ${path.basename(filePath)}`);
  }

  process.exit(0);
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exit(1);
});
