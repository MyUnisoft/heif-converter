// Import Node.js Dependencies
import fs from "fs/promises";
import path from "path";
import url from "url";

// Import Third-Party Dependencies
import { Bench } from "tinybench";
import convert from "heic-convert";

// Import Internal Dependencies
import lib from "../index.js";

// CONSTANTS
const kBench = new Bench();
const kImageNb = process.argv.at(-1);
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

if (!["1", "2", "3"].includes(kImageNb)) {
  throw new Error("Command argument expected");
}

const filename = path.join(__dirname, "image" + kImageNb + ".heic");
async function run() {
  const buffer = await fs.readFile(filename);

  kBench
    .add("JPG ==> heif-converter", async() => {
      await lib.toJpeg(buffer, { quality: 10 });
    })
    .add("JPG ==> heic-convert", async() => {
      await convert({
        buffer,
        format: "JPEG",
        quality: 0.75
      });
    })
    .add("PNG ==> heif-converter", async() => {
      await lib.toPng(buffer);
    })
    .add("PNG ==> heic-convert", async() => {
      await convert({
        buffer,
        format: "PNG"
      });
    });

  await kBench.warmup();
  await kBench.run();

  console.table(kBench.table());
}

run();
