/**
 * Copies Cesium's static assets (workers, widgets CSS, third-party libs)
 * into /public/cesium so they can be served alongside the Next.js app.
 * Run automatically via the "postinstall" npm script.
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "node_modules", "cesium", "Build", "Cesium");
const DEST = path.join(__dirname, "..", "public", "cesium");
const FOLDERS = ["Workers", "ThirdParty", "Assets", "Widgets"];

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

if (!fs.existsSync(SRC)) {
  console.warn("[copy-cesium-assets] Cesium build not found, skipping.");
  process.exit(0);
}

for (const folder of FOLDERS) {
  copyRecursive(path.join(SRC, folder), path.join(DEST, folder));
}

console.log("[copy-cesium-assets] Cesium static assets copied to public/cesium");
