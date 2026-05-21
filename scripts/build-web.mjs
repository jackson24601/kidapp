import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";

const files = [
  "index.html",
  "app.js",
  "styles.css",
  "manifest.webmanifest",
  "support.html",
  "support.css",
  "privacy.html",
];
const outputDirectory = "dist";

await rm(outputDirectory, { force: true, recursive: true });
await mkdir(outputDirectory, { recursive: true });

for (const file of files) {
  const destination = join(outputDirectory, file);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(file, destination);
}

console.log(`Built ${files.length} files into ${outputDirectory}/`);
