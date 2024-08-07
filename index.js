// Import Node.js Dependencies
const { Readable } = require("node:stream");
const fs = require("node:fs");

// Import Third-Party Dependencies
const { familySync, MUSL } = require("detect-libc");

// CONSTANTS
const { arch, platform } = process;
const compiler = familySync() === MUSL ? "musl" : "";
const kPlatform = `${platform}${compiler}-${arch}`;

const binaryPaths = [
  `./src/build/Release/converter.node`,
  `@myunisoft/heif-converter.${kPlatform}/converter.node`
];
let lib = null;
const errors = [];
for (const binaryPath of binaryPaths) {
  try {
    lib = require(binaryPath);

    break;
  }
  catch (error) {
    errors.push(error);
  }
}

if (lib === null) {
  const errorMessages = errors.map((error) => error.message);
  errorMessages.unshift(`You cannot use heif-converter on the following platform: ${kPlatform}`);

  throw new Error(errorMessages.join("\n"));
}

async function getBufferFromInput(input) {
  let stream = input;
  if (typeof input === "string") {
    stream = fs.createReadStream(input);
  }
  else if (input instanceof Buffer) {
    stream = Readable.from(stream);
  }

  const buffers = [];
  for await (const chunk of stream) {
    buffers.push(chunk);
  }

  return Buffer.concat(buffers);
}

module.exports = {
  version() {
    return lib.version();
  },
  async toJpeg(input, options = { quality: 75 }) {
    const buffer = await getBufferFromInput(input);

    return await new Promise((res, rej) => lib.toJpeg(
      buffer,
      undefined,
      options,
      (err, data) => (err ? rej(err) : res(data))
    ));
  },

  async toPng(input, options = { compression: 1 }) {
    const buffer = await getBufferFromInput(input);

    return await new Promise((res, rej) => lib.toPng(
      buffer,
      undefined,
      options,
      (err, data) => (err ? rej(err) : res(data))
    ));
  },

  async extract(input) {
    const buffer = await getBufferFromInput(input);
    const ids = lib.extractIds(buffer);

    return ids.map((id) => {
      return {
        toJpeg: (options = { quality: 75 }) => new Promise((res, rej) => {
          lib.toJpeg(buffer, id, options, (err, data) => (err ? rej(err) : res(data)));
        }),
        toPng: (options = { compression: 1 }) => new Promise((res, rej) => {
          lib.toPng(buffer, id, options, (err, data) => (err ? rej(err) : res(data)));
        })
      };
    });
  }
};
