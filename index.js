// Import Node.js Dependencies
const { Readable } = require("node:stream");
const consumers = require("node:stream/consumers");

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

function getBufferOrStringFromInput(input) {
  if (typeof input === "string" || input instanceof Buffer) {
    return input;
  }

  if (input instanceof Readable) {
    return consumers.buffer(input);
  }

  throw new Error(
    "[heif-converter] : Invalid input type. Expected a Buffer, a String or a Stream."
  );
}

module.exports = {
  version() {
    return lib.version();
  },
  async toJpeg(input, options = { quality: 75 }) {
    const data = await getBufferOrStringFromInput(input);

    return await new Promise((res, rej) => lib.toJpeg(
      data,
      undefined,
      options,
      (err, buffer) => (err ? rej(err) : res(buffer))
    ));
  },

  async toPng(input, options = { compression: 1 }) {
    const data = await getBufferOrStringFromInput(input);

    return await new Promise((res, rej) => lib.toPng(
      data,
      undefined,
      options,
      (err, buffer) => (err ? rej(err) : res(buffer))
    ));
  },

  async extract(input) {
    const data = await getBufferOrStringFromInput(input);
    const ids = lib.extractIds(data);

    return ids.map((id) => {
      return {
        toJpeg: (options = { quality: 75 }) => new Promise((res, rej) => {
          lib.toJpeg(data, id, options, (err, buffer) => (err ? rej(err) : res(buffer)));
        }),
        toPng: (options = { compression: 1 }) => new Promise((res, rej) => {
          lib.toPng(data, id, options, (err, buffer) => (err ? rej(err) : res(buffer)));
        })
      };
    });
  }
};
