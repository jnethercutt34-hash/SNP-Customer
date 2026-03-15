/**
 * Server-side document ingestion.
 *
 * Scans public/documents/ recursively, extracts plain text from every
 * PDF, DOCX, XLSX, and XLS file it finds, and returns the combined text
 * as a context string ready to inject into an LLM system prompt.
 *
 * Results are cached in memory for the lifetime of the Node.js process.
 */

import fs from "fs";
import path from "path";

export interface DocumentChunk {
  fileName: string;
  folder: string;
  text: string;
}

let cache: DocumentChunk[] | null = null;

const SUPPORTED_EXTENSIONS = new Set([".pdf", ".docx", ".xlsx", ".xls", ".txt"]);

function collectFiles(
  dir: string,
  docsRoot: string
): { fileName: string; folder: string; fullPath: string }[] {
  const results: { fileName: string; folder: string; fullPath: string }[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, docsRoot));
    } else if (
      entry.isFile() &&
      SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
    ) {
      results.push({
        fileName: entry.name,
        folder: path.relative(docsRoot, dir).replace(/\\/g, "/"),
        fullPath,
      });
    }
  }

  return results;
}

async function extractPdf(fullPath: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const buffer = fs.readFileSync(fullPath);
  const data = await pdfParse(buffer);
  return data.text as string;
}

async function extractDocx(fullPath: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mammoth = require("mammoth");
  const result = await mammoth.extractRawText({ path: fullPath });
  return result.value as string;
}

function extractXlsx(fullPath: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require("xlsx");
  const wb = XLSX.readFile(fullPath);
  return (wb.SheetNames as string[])
    .map((name: string) => {
      const sheet = wb.Sheets[name];
      return `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(sheet)}`;
    })
    .join("\n\n");
}

export async function loadAllDocuments(): Promise<DocumentChunk[]> {
  if (cache) return cache;

  const docsRoot = path.join(process.cwd(), "public", "documents");
  if (!fs.existsSync(docsRoot)) {
    cache = [];
    return cache;
  }

  const files = collectFiles(docsRoot, docsRoot);
  const chunks: DocumentChunk[] = [];

  for (const { fileName, folder, fullPath } of files) {
    const ext = path.extname(fileName).toLowerCase();
    let text = "";

    try {
      if (ext === ".pdf") {
        text = await extractPdf(fullPath);
      } else if (ext === ".docx") {
        text = await extractDocx(fullPath);
      } else if (ext === ".xlsx" || ext === ".xls") {
        text = extractXlsx(fullPath);
      } else if (ext === ".txt") {
        text = fs.readFileSync(fullPath, "utf-8");
      }
    } catch (err) {
      console.warn(`[document-store] Failed to parse ${fullPath}:`, err);
      continue;
    }

    const trimmed = text.trim();
    if (trimmed) {
      chunks.push({ fileName, folder, text: trimmed });
    }
  }

  console.info(
    `[document-store] Loaded ${chunks.length} document(s) from ${docsRoot}`
  );

  cache = chunks;
  return cache;
}

export function buildContext(chunks: DocumentChunk[]): string {
  if (chunks.length === 0) {
    return "No documents are currently loaded in the knowledge base.";
  }

  return chunks
    .map((c) => {
      const label = c.folder ? `${c.folder}/${c.fileName}` : c.fileName;
      return `=== ${label} ===\n${c.text}`;
    })
    .join("\n\n");
}

export function clearDocumentCache(): void {
  cache = null;
}
