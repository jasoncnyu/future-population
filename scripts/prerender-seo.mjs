import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://population.simlab.me";
const DIST_DIR = path.resolve("dist");
const TEMPLATE_PATH = path.join(DIST_DIR, "index.html");

const locales = [
  "en",
  "fr",
  "de",
  "es",
  "it",
  "pt",
  "nl",
  "sv",
  "da",
  "fi",
  "is",
  "nb",
  "pl",
  "cs",
  "sk",
  "sl",
  "hu",
  "et",
  "lv",
  "lt",
  "el",
  "tr",
  "he",
  "ja",
  "ko",
];

const routeSuffixes = ["", "/theory", "/about"];

function buildAlternateLinks(routeSuffix) {
  const links = locales
    .map(
      (locale) =>
        `    <link rel="alternate" hreflang="${locale}" href="${SITE_URL}/${locale}${routeSuffix}" />`
    )
    .join("\n");

  return `${links}\n    <link rel="alternate" hreflang="x-default" href="${SITE_URL}/en${routeSuffix}" />`;
}

function injectSeo(html, locale, routeSuffix) {
  const canonical = `    <link rel="canonical" href="${SITE_URL}/${locale}${routeSuffix}" />`;
  const alternates = buildAlternateLinks(routeSuffix);

  return html
    .replace("<html lang=\"en\">", `<html lang="${locale}">`)
    .replace("</head>", `${canonical}\n${alternates}\n  </head>`);
}

async function writeRouteHtml(html, locale, routeSuffix) {
  const relativeDir = path.join(locale, routeSuffix.replace(/^\//, ""));
  const dirPath = path.join(DIST_DIR, relativeDir);
  await mkdir(dirPath, { recursive: true });
  await writeFile(path.join(dirPath, "index.html"), injectSeo(html, locale, routeSuffix));
}

async function main() {
  const template = await readFile(TEMPLATE_PATH, "utf8");

  for (const locale of locales) {
    for (const routeSuffix of routeSuffixes) {
      await writeRouteHtml(template, locale, routeSuffix);
    }
  }
}

await main();
