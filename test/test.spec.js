// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Import Third-Party Dependencies
import { fileTypeFromBuffer, fileTypeFromStream } from "file-type";

// Import Internal Dependencies
import lib from "../index.js";

// CONSTANTS
const kDirname = path.dirname(fileURLToPath(import.meta.url));

describe("version", () => {
  it("Should get libheif version", () => {
    assert.strictEqual(/\d{1}\.\d{1,2}\.\d{1,2}/.test(lib.version()), true);
  });
});

describe("toJpeg", () => {
  it("Should convert .heic to .jpeg", async() => {
    const heifFilePath = path.join(kDirname, "image.heic");

    const heic = await fileTypeFromStream(createReadStream(heifFilePath));
    assert.strictEqual(heic.ext, "heic");

    const output = await lib.toJpeg(path.join(kDirname, "image.heic"));
    const jpeg = await fileTypeFromBuffer(output);
    assert.strictEqual(jpeg.ext, "jpg");
  });

  it("Should accept input buffer", async() => {
    const heifFilePath = path.join(kDirname, "image.heic");
    const inputBuffer = await fs.readFile(heifFilePath);

    const output = await lib.toJpeg(inputBuffer);
    assert.strictEqual(output instanceof Buffer, true);
  });

  it("Should accept input stream", async() => {
    const heifFilePath = path.join(kDirname, "image.heic");

    const output = await lib.toJpeg(createReadStream(heifFilePath));
    assert.strictEqual(output instanceof Buffer, true);
  });

  it("Should compress for optional quality", async() => {
    const heifFilePath = path.join(kDirname, "image.heic");

    const [output1, output2] = await Promise.all([
      lib.toJpeg(createReadStream(heifFilePath)),
      lib.toJpeg(createReadStream(heifFilePath), { quality: 1 })
    ]);

    assert.strictEqual(output1.byteLength > output2.byteLength, true);
  });
});

describe("toPng", () => {
  it("Should convert .heic to .png", async() => {
    const heifFilePath = path.join(kDirname, "image.heic");

    const heic = await fileTypeFromStream(createReadStream(heifFilePath));
    assert.strictEqual(heic.ext, "heic");

    const output = await lib.toPng(path.join(kDirname, "image.heic"));
    const png = await fileTypeFromBuffer(output);
    assert.strictEqual(png.ext, "png");
  });

  it("Should accept input buffer", async() => {
    const heifFilePath = path.join(kDirname, "image.heic");
    const inputBuffer = await fs.readFile(heifFilePath);

    const output = await lib.toPng(inputBuffer);
    assert.strictEqual(output instanceof Buffer, true);
  });

  it("Should accept input stream", async() => {
    const heifFilePath = path.join(kDirname, "image.heic");

    const output = await lib.toPng(createReadStream(heifFilePath));
    assert.strictEqual(output instanceof Buffer, true);
  });
});

describe("extract", () => {
  it("Should extract images and return an object with toJpeg and toPng methods", async() => {
    const heifFilePath = path.join(kDirname, "image.heic");
    const images = await lib.extract(createReadStream(heifFilePath));

    assert.strictEqual(images.length, 2);
    assert.strictEqual(typeof images[0].toJpeg === "function", true);
    assert.strictEqual(typeof images[0].toPng === "function", true);
    assert.strictEqual(typeof images[1].toJpeg === "function", true);
    assert.strictEqual(typeof images[1].toPng === "function", true);

    const jpeg1 = await images[0].toJpeg({ quality: 1 });
    const jpeg2 = await images[1].toJpeg();

    assert.strictEqual(jpeg1.byteLength < jpeg2.byteLength, true);
  });
});
