import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
console.log("projectDir", projectDir);
loadEnvConfig(projectDir);
