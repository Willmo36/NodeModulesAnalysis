#!/usr/bin/env node
const arg = require("arg");
import { existsSync } from "fs";
import { main } from "./index";

const args = arg({
  "--dir": String,
  "-d": "--dir",

  "--out": String,
  "-o": "--out"
});

const { "--dir": dir = "./", "--out": out = process.cwd() } = args;

const dirExists = existsSync(dir);
const outExists = existsSync(out);

if (!dirExists) {
  console.error("Input dir does not exist", dir);
  process.exit();
}

if (!outExists) {
  console.error("Output dir does not exist", out);
  process.exit();
}

console.info(`Scanning ${dir}...`);
main(dir, out);

process.on("uncaughtException", err => {
  console.error("Something unhandled happened");
  console.error(err);
  process.exit();
});
