import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"]);
const networkGlobals = new Set(["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "sendBeacon"]);
const networkPackages = /^(?:axios|ky|got|node-fetch|undici)(?:\/|$)/;
const evidenceModulePath = /(?:^|\/)evidence[^/]*(?:\/|$)/i;

function usesNetworkLibrary(moduleName) {
  return networkPackages.test(moduleName);
}

function isEvidenceModule(moduleName) {
  return evidenceModulePath.test(moduleName.replaceAll("\\", "/"));
}

function isContentEntrypoint(filePath) {
  return /^apps\/extension\/entrypoints\/[^/]+\.content\.[cm]?[jt]sx?$/.test(filePath);
}

function forbidsEvidenceImports(filePath) {
  return filePath.startsWith("apps/web/") || filePath.startsWith("apps/extension/src/sync/");
}

function getModuleSpecifier(node) {
  if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
    return node.moduleSpecifier.text;
  }

  if (
    ts.isCallExpression(node) &&
    (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require")) &&
    node.arguments.length === 1 &&
    ts.isStringLiteral(node.arguments[0])
  ) {
    return node.arguments[0].text;
  }

  return undefined;
}

export function inspectSource(filePath, sourceText) {
  const normalizedPath = filePath.replaceAll("\\", "/");
  const sourceFile = ts.createSourceFile(normalizedPath, sourceText, ts.ScriptTarget.Latest, true);
  const violations = [];

  function visit(node) {
    const moduleSpecifier = getModuleSpecifier(node);

    if (isContentEntrypoint(normalizedPath)) {
      if (moduleSpecifier && usesNetworkLibrary(moduleSpecifier)) {
        violations.push("content scripts must not import network client packages");
      }

      if (ts.isIdentifier(node) && networkGlobals.has(node.text)) {
        violations.push(`content scripts must not reference ${node.text}`);
      }
    }

    if (forbidsEvidenceImports(normalizedPath) && moduleSpecifier && isEvidenceModule(moduleSpecifier)) {
      violations.push("sync and web code must not import local evidence modules");
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return [...new Set(violations)];
}

async function listSourceFiles(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(entryPath)));
    } else if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }
  return files;
}

async function main() {
  const appDirectories = [path.join(repositoryRoot, "apps", "extension"), path.join(repositoryRoot, "apps", "web")];
  const files = (await Promise.all(appDirectories.map(listSourceFiles))).flat();
  const violations = [];

  for (const absolutePath of files) {
    const relativePath = path.relative(repositoryRoot, absolutePath).replaceAll("\\", "/");
    const source = await readFile(absolutePath, "utf8");
    for (const violation of inspectSource(relativePath, source)) {
      violations.push(`${relativePath}: ${violation}`);
    }
  }

  if (violations.length > 0) {
    console.error(violations.join("\n"));
    process.exitCode = 1;
    return;
  }

  console.log(`Boundary checks passed for ${files.length} source files.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
