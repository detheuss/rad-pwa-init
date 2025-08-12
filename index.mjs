#!/usr/bin/env node
import prompts from "prompts";
import pc from "picocolors";
import { downloadTemplate } from "giget";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function exit(msg) {
  console.log(pc.red(msg));
  process.exit(1);
}

async function main() {
  const argName = process.argv[2];
  const onCancel = () => exit("Cancelled.");
  const { projectName } = await prompts(
    {
      type: argName ? null : "text",
      name: "projectName",
      message: "Project name:",
      initial: "rad-pwa-app",
    },
    { onCancel }
  );

  const targetName = argName || projectName || "rad-pwa-app";
  const targetDir = path.resolve(process.cwd(), targetName);

  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    exit(`Directory ${targetName} already exists and is not empty.`);
  }

  console.log(pc.cyan(`\nScaffolding into ${pc.bold(targetName)}...\n`));

  // Public repo tarball; default branch is used automatically
  const repo = "github:detheuss/rad-pwa#master";

  try {
    await downloadTemplate(repo, {
      dir: targetDir,
      force: true,
    });
  } catch (err) {
    exit(`Failed to download template: ${String(err)}`);
  }

  // Optional: rename in package.json
  const pkgPath = path.join(targetDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      pkg.name = targetName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-");
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    } catch {
      // ignore
    }
  }

  console.log(pc.green("Done.\n"));
  console.log("Next steps:");
  console.log(pc.bold(`  cd ${targetName}`));
  console.log("  npm install");
  console.log("  npm run dev\n");
}

main();
