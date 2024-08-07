// Import Node.js Dependencies
import { Readable } from "stream";

// Interfaces
interface JpegOptions {
  quality?: number;
}

interface PngOptions {
  compression?: number;
}

interface ExtractedImage {
  toJpeg: (opts?: JpegOptions) => Promise<Buffer>;
  toPng: (opts?: PngOptions) => Promise<Buffer>;
}

declare const types: {
  toJpeg(input: string | Buffer | Readable, options?: JpegOptions): Promise<Buffer>;
  toPng(input: string | Buffer | Readable, options?: PngOptions): Promise<Buffer>;
  extract(input: string | Buffer | Readable): Promise<ExtractedImage[]>;
  version(): string;
};

export default types;
