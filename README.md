<p align="center">
<img src="./docs/heif-converter.jpg"/>
</p>

# 🥦 HEIF-Converter
> This module uses the C APIs libheif to bind it in Node.js using N-API.

## ⭐ Introduction

The **libheif** library is a software library used to read and write HEIF (High Efficiency Image Format) files.

HEIF is a file format for images and image sequences (like photos and videos) that offers superior compression compared to traditional formats like JPEG and PNG while maintaining high image quality.

For more information about the librarie used in this project, you can visit the following links:
* [libheif](https://github.com/strukturag/libheif/tree/master)
* [libjpeg](https://github.com/winlibs/libjpeg)
* [libpng](https://github.com/pnggroup/libpng)

## ❤️ Motivations

We created this module because, to date, we have not yet found a package that uses Node.js bindings for the libheif C library. Libraries like [heic-convert](https://github.com/catdad-experiments/heic-convert), and others are very interesting but do not allow full utilization of the performance and speed of the C library.

Moreover, this project allows you to use asynchronous methods that will run in an **AsyncWorker**, which will prevent blocking the event loop of your application.

## 💥 Prerequisites

Before installing **heif-converter**, make sure you have the following tools installed on your machine:

* [**Node.js**](https://nodejs.org/en/download/package-manager/)

## 🎈 Conversion
The **heif-converter** package facilitates the conversion of HEIF (High Efficiency Image File Format) images to other formats. However, it's important to note that this package specifically handles static images and does not support animated images. Additionally, metadata and auxiliary images within the HEIF file are not currently supported by the converter. You're welcome to contribute by suggesting improvements or enhancements to its functionality 😃.
> heif-converter does not work on macOS, only on Windows x64 and Linux x64. 

## 🦴 Installation

```bash
npm install heif-converter
```

## 🚀 API
- ### toJpeg

The **toJpeg** method converts the primary image of a HEIC file to **jpg**.

```ts
interface JpegOptions {
  // 0 to 100.
  quality?: number;
}

function toJpeg(
  input: string | Buffer | Readable, 
  options?: JpegOptions
): Promise<Buffer>;
```
```js
import lib from "../index.js";

const jpegBuffer = await lib.toJpeg("image.heic", { quality: 20 });
```
> The value of the quality option is from 0 to 100. Default 75.

- ### toPng

The **toPng** method converts the primary image of a HEIC file to **png**.
```ts
function toPng(input: string | Buffer | Readable): Promise<Buffer>;
```
```js
import lib from "../index.js";

const pngBuffer = await lib.toPng("image.heic", { compression: 5 });
```
> The value of the compression` option is from 1 to 9. Default 1.

- ### extract

The **extract** method allows you to obtain a list of images contained in a HEIC file. Each extracted image has two methods, **toJpeg** and **toPng**, which allow you to convert the image to JPEG or PNG format, respectively, as documented above.
```ts
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

function extract(input: string | Buffer | Readable): Promise<ExtractedImage[]>;
```
```js
import lib from "../index.js";

const images = await lib.extract("image.heic");
for (image of images) {
  const jpegBuffer = await image.toJpeg({ quality: 50 });
}
```

## Benchmark

The benchmark is accessible in the ./bench folder. You can run the following commands.
```bash
$ node ./bench/bench.js 1
# OR
$ node ./bench/bench.js 2
# OR
$ node ./bench/bench.js 3
```
This benchmark was conducted on a mid-range machine

#### HEIC file containing an image of 3992*2992.
```
┌─────────┬──────────────────────────┬─────────┬────────────────────┬──────────┬─────────┐
│ (index) │ Task Name                │ ops/sec │ Average Time (ns)  │ Margin   │ Samples │
├─────────┼──────────────────────────┼─────────┼────────────────────┼──────────┼─────────┤
│ 0       │ 'JPG ==> heif-converter' │ '5'     │ 168399799.99999997 │ '±1.24%' │ 10      │
│ 1       │ 'JPG ==> heic-convert'   │ '0'     │ 1094995630.0000002 │ '±0.63%' │ 10      │
│ 2       │ 'PNG ==> heif-converter' │ '1'     │ 715495539.9999995  │ '±0.18%' │ 10      │
│ 3       │ 'PNG ==> heic-convert'   │ '0'     │ 1691614560.0000005 │ '±0.47%' │ 10      │
└─────────┴──────────────────────────┴─────────┴────────────────────┴──────────┴─────────┘
```


#### HEIC file containing an image of 2400*1600.
```
┌─────────┬──────────────────────────┬─────────┬────────────────────┬──────────┬─────────┐
│ (index) │ Task Name                │ ops/sec │ Average Time (ns)  │ Margin   │ Samples │
├─────────┼──────────────────────────┼─────────┼────────────────────┼──────────┼─────────┤
│ 0       │ 'JPG ==> heif-converter' │ '9'     │ 107019470.00000027 │ '±0.67%' │ 10      │
│ 1       │ 'JPG ==> heic-convert'   │ '3'     │ 287341830.0000001  │ '±1.53%' │ 10      │
│ 2       │ 'PNG ==> heif-converter' │ '5'     │ 188958699.9999996  │ '±1.03%' │ 10      │
│ 3       │ 'PNG ==> heic-convert'   │ '2'     │ 407586150.0000004  │ '±0.96%' │ 10      │
└─────────┴──────────────────────────┴─────────┴────────────────────┴──────────┴─────────┘
```


#### HEIC file containing an image of 640*426.
```
┌─────────┬──────────────────────────┬─────────┬────────────────────┬───────────┬─────────┐
│ (index) │ Task Name                │ ops/sec │ Average Time (ns)  │ Margin    │ Samples │
├─────────┼──────────────────────────┼─────────┼────────────────────┼───────────┼─────────┤
│ 0       │ 'JPG ==> heif-converter' │ '108'   │ 9191369.090909092  │ '±0.88%'  │ 55      │
│ 1       │ 'JPG ==> heic-convert'   │ '31'    │ 31666893.749999985 │ '±10.25%' │ 16      │
│ 2       │ 'PNG ==> heif-converter' │ '66'    │ 15030594.117647083 │ '±1.22%'  │ 34      │
│ 3       │ 'PNG ==> heic-convert'   │ '31'    │ 31297225.000000026 │ '±2.71%'  │ 16      │
└─────────┴──────────────────────────┴─────────┴────────────────────┴───────────┴─────────┘
```