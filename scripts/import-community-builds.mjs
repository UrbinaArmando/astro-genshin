import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

const SHEET_ID = "2PACX-1vRq-sQxkvdbvaJtQAGG6iVz2q2UN9FCKZ8Mkyis87QHFptcOU3ViLh0_PJyMxFSgwJZrd10kbYpQFl1";
const SOURCE_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pubhtml`;

const ELEMENT_TABS = [
  { element: "Pyro", gid: "954718212" },
  { element: "Hydro", gid: "1354385732" },
  { element: "Electro", gid: "408609723" },
  { element: "Dendro", gid: "1468017260" },
  { element: "Cryo", gid: "1169063456" },
  { element: "Anemo", gid: "653464458" },
  { element: "Geo", gid: "1780570478" }
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.resolve(ROOT_DIR, "src", "content", "community-builds");

const normalize = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const cleanText = (value = "") =>
  value
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\u200b/g, "")
    .replace(/â©/g, "★")
    .trim();

const linesFromCell = (value = "") =>
  cleanText(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const isCharacterHeader = (cell, row) => {
  const value = cleanText(cell);
  if (!value) return false;
  if (!row.slice(2).every((col) => !cleanText(col))) return false;
  if (value.includes("Last Updated") || value.includes("STAR") || value.includes("Weapons and Artifacts") || value.includes("ROLE")) return false;
  return /^[A-Z0-9 .()'\-]+$/.test(value);
};

const isDataRow = (roleCell, weaponCell, artifactCell) => {
  const role = cleanText(roleCell);
  if (!role || role === "ROLE") return false;
  if (role.startsWith(">")) return false;
  return Boolean(cleanText(weaponCell) || cleanText(artifactCell));
};

const titleCaseName = (value) =>
  cleanText(value)
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .replace(/\bMc([a-z])/g, (_, c) => `Mc${c.toUpperCase()}`)
    .replace(/\bD'([a-z])/g, (_, c) => `D'${c.toUpperCase()}`);

const yamlEscape = (value) => String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const yamlBlock = (value, indent = 0) => {
  const space = " ".repeat(indent);
  const text = cleanText(value);
  if (!text) return `${space}""`;
  const body = text
    .split("\n")
    .map((line) => `${space}  ${line}`)
    .join("\n");
  return `${space}|-\n${body}`;
};

const toFrontmatter = (record) => {
  const rows = [
    "---",
    `character: \"${yamlEscape(record.character)}\"`,
    `slug: \"${yamlEscape(record.slug)}\"`,
    `source: \"${yamlEscape(SOURCE_URL)}\"`,
    "entries:"
  ];

  for (const entry of record.entries) {
    rows.push("  - element: \"" + yamlEscape(entry.element) + "\"");
    rows.push("    role: \"" + yamlEscape(entry.role) + "\"");
    rows.push("    weapons: " + yamlBlock(entry.weapons, 4).trimStart());
    rows.push("    artifacts: " + yamlBlock(entry.artifacts, 4).trimStart());
    rows.push("    mainStats: " + yamlBlock(entry.mainStats, 4).trimStart());
    rows.push("    subStats: " + yamlBlock(entry.subStats, 4).trimStart());
    rows.push("    talentPriority: " + yamlBlock(entry.talentPriority, 4).trimStart());
    rows.push("    abilityTips: " + yamlBlock(entry.abilityTips, 4).trimStart());
    rows.push("    updated: \"" + yamlEscape(entry.updated ?? "") + "\"");
  }

  rows.push("---");
  rows.push("");
  rows.push(`# ${record.character}`);
  rows.push("");
  rows.push("Importado automaticamente desde la hoja comunitaria publica.");
  rows.push("");

  return rows.join("\n");
};

const recordsByCharacter = new Map();

for (const tab of ELEMENT_TABS) {
  const csvUrl = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?output=csv&gid=${tab.gid}`;
  const response = await fetch(csvUrl);
  if (!response.ok) {
    console.warn(`Skipping ${tab.element}: ${response.status}`);
    continue;
  }

  const csvText = await response.text();
  const rows = parse(csvText, {
    relax_column_count: true,
    skip_empty_lines: false
  });

  let currentCharacter = null;
  let currentUpdated = "";

  for (const rawRow of rows) {
    const row = Array.isArray(rawRow) ? rawRow.map((col) => (typeof col === "string" ? col : "")) : [];
    const cellB = row[1] ?? "";

    if (isCharacterHeader(cellB, row)) {
      currentCharacter = titleCaseName(cellB);
      continue;
    }

    const updatedCell = cleanText(cellB);
    if (updatedCell.startsWith("Last Updated:")) {
      currentUpdated = updatedCell.replace(/^Last Updated:\s*/i, "").trim();
      continue;
    }

    if (!currentCharacter) {
      continue;
    }

    const role = row[2] ?? "";
    const weapons = row[3] ?? "";
    const artifacts = row[4] ?? "";

    if (!isDataRow(role, weapons, artifacts)) {
      continue;
    }

    const key = normalize(currentCharacter);
    const record = recordsByCharacter.get(key) ?? {
      character: currentCharacter,
      slug: key,
      entries: []
    };

    record.entries.push({
      element: tab.element,
      role: cleanText(role),
      weapons: linesFromCell(weapons).join("\n"),
      artifacts: linesFromCell(artifacts).join("\n"),
      mainStats: linesFromCell(row[5] ?? "").join("\n"),
      subStats: linesFromCell(row[6] ?? "").join("\n"),
      talentPriority: linesFromCell(row[7] ?? "").join("\n"),
      abilityTips: linesFromCell(row[8] ?? "").join("\n"),
      updated: currentUpdated
    });

    recordsByCharacter.set(key, record);
  }
}

await mkdir(OUTPUT_DIR, { recursive: true });

for (const record of recordsByCharacter.values()) {
  const content = toFrontmatter(record);
  const filePath = path.join(OUTPUT_DIR, `${record.slug}.md`);
  await writeFile(filePath, content, "utf8");
}

console.log(`Imported ${recordsByCharacter.size} character build files into ${OUTPUT_DIR}`);
