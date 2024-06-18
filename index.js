// Import Node.js Dependencies
const { Readable } = require("node:stream");
const fs = require("node:fs");

// CONSTANTS
const { arch, platform } = process;
const kPlatform = `${platform}-${arch}`;
const lib = require(`@myunisoft/heif-converter.${kPlatform}/heif-converter.node`);

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
  async toJpeg(input, options = { quality: 75 }) {
    const buffer = await getBufferFromInput(input);
    const [id] = lib.extractIds(buffer);

    return await new Promise((res, rej) => lib.toJpeg(
      buffer,
      id,
      options,
      (err, data) => (err ? rej(err) : res(data))
    ));
  },

  async toPng(input, options = { compression: 1 }) {
    const buffer = await getBufferFromInput(input);
    const [id] = lib.extractIds(buffer);

    return await new Promise((res, rej) => lib.toPng(
      buffer,
      id,
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
