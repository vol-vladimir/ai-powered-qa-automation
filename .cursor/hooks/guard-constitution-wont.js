#!/usr/bin/env node
/**
 * afterFileEdit constitution WON'T guard.
 *
 * Matcher in hooks.json is the tool type (Write), not a path. This script
 * keeps only tests/** and pages/** via file_path from stdin JSON.
 *
 * Blocks (exit 2) when an edit *introduces*:
 *   - waitForTimeout(
 *   - an XPath locator
 *   - the any type
 *   - a hardcoded credential
 *   - a tag on test.describe()
 *   - a removed or commented-out expect(
 *
 * Existing violations already in the file are not re-blocked.
 */

const fs = require("fs");
const path = require("path");

const IN_SCOPE = /(?:^|\/)(tests|pages)\/.+\.(ts|tsx|js|jsx)$/;

const WAIT_FOR_TIMEOUT = /\bwaitForTimeout\s*\(/g;
const XPATH_LOCATOR =
  /\.locator\s*\(\s*(['"`])(?:xpath\s*=\s*)?(?:\/\/|\/html\b|\/[a-z])/gi;
const ANY_TYPE = /(?::\s*any\b|\bas\s+any\b|<\s*any\b|,\s*any\b)/g;
const EMAIL_LITERAL =
  /(['"`])[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\1/g;
const SECRET_ASSIGNMENT =
  /\b(?:password|passwd|secret|api[_-]?token|DIDAXIS_(?:EMAIL|PASSWORD|API_TOKEN))\s*[:=]\s*(['"`])(?!process\.env)[^'"`]+?\1/gi;
const BEARER_LITERAL = /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/g;
const DESCRIBE_TAG =
  /test\.describe(?:\.\w+)*\s*\(\s*(['"`])(?:\\.|(?!\1).)*\1\s*,\s*\{[\s\S]*?\btags?\s*:/g;

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
  let inTemplate = false;
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
    if (c === "`" && !inSingle && !inDouble) {
      inTemplate = !inTemplate;
      continue;
    }
    if (c === "'" && !inDouble && !inTemplate) {
      inSingle = !inSingle;
      continue;
    }
    if (c === '"' && !inSingle && !inTemplate) {
      inDouble = !inDouble;
      continue;
    }
    if (
      !inSingle &&
      !inDouble &&
      !inTemplate &&
      c === "/" &&
      line[i + 1] === "/"
    ) {
      return line.slice(0, i);
    }
  }

  return line;
}

function activeCode(source) {
  const lines = [];
  let inBlock = false;

  for (const rawLine of String(source).split(/\r?\n/)) {
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
        line = `${line.slice(0, start)} ${line.slice(end + 2)}`;
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

    lines.push(stripInlineComment(line));
  }

  return lines.join("\n");
}

function countMatches(source, regex) {
  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
  const re = new RegExp(regex.source, flags);
  return (activeCode(source).match(re) || []).length;
}

function countActiveExpects(source) {
  return countMatches(source, /expect\s*\(/g);
}

function reconstructBefore(content, edits) {
  let before = content;
  for (let i = edits.length - 1; i >= 0; i -= 1) {
    const { old_string: oldString, new_string: newString } = edits[i];
    if (typeof oldString !== "string" || typeof newString !== "string") {
      continue;
    }
    if (newString === "") {
      before = `${before}${oldString}`;
      continue;
    }
    const index = before.lastIndexOf(newString);
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
    const oldRaw = (oldString.match(/expect\s*\(/g) || []).length;
    const newRaw = (newString.match(/expect\s*\(/g) || []).length;

    if (oldActive > 0 && newActive < oldActive && newRaw >= oldRaw) {
      return true;
    }
  }
  return false;
}

function introduced(before, after, regex) {
  return countMatches(after, regex) - countMatches(before, regex);
}

function collectWontViolations(before, after, edits) {
  const reasons = [];
  const file = path.basename(after.fileName || "file");

  if (introduced(before, after.source, WAIT_FOR_TIMEOUT) > 0) {
    reasons.push(`introduced waitForTimeout( in ${file}`);
  }
  if (introduced(before, after.source, XPATH_LOCATOR) > 0) {
    reasons.push(`introduced an XPath locator in ${file}`);
  }
  if (introduced(before, after.source, ANY_TYPE) > 0) {
    reasons.push(`introduced the any type in ${file}`);
  }
  if (
    introduced(before, after.source, EMAIL_LITERAL) > 0 ||
    introduced(before, after.source, SECRET_ASSIGNMENT) > 0 ||
    introduced(before, after.source, BEARER_LITERAL) > 0
  ) {
    reasons.push(`introduced a hardcoded credential in ${file}`);
  }
  if (introduced(before, after.source, DESCRIBE_TAG) > 0) {
    reasons.push(`introduced a tag on test.describe() in ${file}`);
  }

  const beforeCount = countActiveExpects(before);
  const afterCount = countActiveExpects(after.source);
  if (afterCount < beforeCount) {
    reasons.push(
      `active expect( count fell from ${beforeCount} to ${afterCount} in ${file}`,
    );
  }
  if (editCommentedOutExpect(edits)) {
    reasons.push(`an expect( was commented out in ${file}`);
  }

  return reasons;
}

function deny(reasons) {
  const text = reasons.join("; ");
  const payload = {
    permission: "deny",
    user_message: `Constitution WON'T guard blocked this edit: ${text}`,
    agent_message:
      `Refused a mechanically-checkable WON'T violation. ${text} ` +
      "Fix locators or POMs instead of sleeps, XPath, any, hardcoded secrets, describe tags, or weakened expect().",
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
    process.stderr.write("guard-constitution-wont: invalid stdin JSON\n");
    process.exit(1);
  }

  const filePath = input.file_path || input.filePath;
  if (!filePath) {
    process.stderr.write("guard-constitution-wont: missing file_path\n");
    process.exit(1);
  }

  const normalized = String(filePath).replace(/\\/g, "/");
  if (!IN_SCOPE.test(normalized)) {
    process.exit(0);
  }

  if (!fs.existsSync(filePath)) {
    process.stderr.write(`guard-constitution-wont: file not found: ${filePath}\n`);
    process.exit(1);
  }

  const edits = Array.isArray(input.edits) ? input.edits : [];
  if (edits.length === 0) {
    process.stderr.write("guard-constitution-wont: missing edits array\n");
    process.exit(1);
  }

  const afterSource = fs.readFileSync(filePath, "utf8");
  let before;

  try {
    before = reconstructBefore(afterSource, edits);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }

  const reasons = collectWontViolations(
    before,
    { source: afterSource, fileName: filePath },
    edits,
  );

  if (reasons.length > 0) {
    deny(reasons);
  }

  process.exit(0);
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exit(1);
});
