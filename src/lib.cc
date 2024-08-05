#include <napi.h>
#include <heif.h>
#include <turbojpeg.h>
#include <png.h>
#include <vector>
#include <string>
#include <stdexcept>
#include <cstring>

class ToJpegWorker : public Napi::AsyncWorker {
public:
    ToJpegWorker(const Napi::Buffer<uint8_t>& buffer, heif_item_id image_id, const Napi::Object& options, Napi::Function& callback)
        : Napi::AsyncWorker(callback), bufferRef(Napi::Persistent(buffer)), imageId(image_id) {
        data = buffer.Data();
        size = buffer.Length();
        quality = options.Get("quality").As<Napi::Number>().Int32Value();
    }

    ~ToJpegWorker() {}

    void Execute() override {
        struct heif_context* ctx = heif_context_alloc();
        struct heif_error err = heif_context_read_from_memory(ctx, data, size, nullptr);
        if (err.code != heif_error_Ok) {
            heif_context_free(ctx);
            SetError("Failed to read HEIF data: " + std::string(err.message));
            return;
        }

        struct heif_image_handle* handle;
        if (imageId == -1) {
            err = heif_context_get_primary_image_handle(ctx, &handle);
        } else {
            err = heif_context_get_image_handle(ctx, imageId, &handle);
        }

        if (err.code != heif_error_Ok) {
            heif_context_free(ctx);
            SetError("Failed to get image handle: " + std::string(err.message));
            return;
        }

        struct heif_image* img;
        err = heif_decode_image(handle, &img, heif_colorspace_RGB, heif_chroma_interleaved_RGB, nullptr);
        if (err.code != heif_error_Ok) {
            heif_image_handle_release(handle);
            heif_context_free(ctx);
            SetError("Failed to decode HEIF image: " + std::string(err.message));
            return;
        }

        int width = heif_image_get_width(img, heif_channel_interleaved);
        int height = heif_image_get_height(img, heif_channel_interleaved);
        int stride;
        const uint8_t* data = heif_image_get_plane_readonly(img, heif_channel_interleaved, &stride);

        tjhandle tjInstance = tjInitCompress();
        unsigned char* jpegBuf = nullptr;
        unsigned long jpegSize = 0;

        int flags = 0;
        int pixelFormat = TJPF_RGB;

        int ret = tjCompress2(tjInstance, data, width, 0, height, pixelFormat, &jpegBuf, &jpegSize, TJSAMP_444, quality, flags);
        if (ret != 0) {
            tjDestroy(tjInstance);
            heif_image_release(img);
            heif_image_handle_release(handle);
            heif_context_free(ctx);
            SetError("Failed to compress JPEG: " + std::string(tjGetErrorStr2(tjInstance)));
            return;
        }

        tjDestroy(tjInstance);

        jpegData.assign(jpegBuf, jpegBuf + jpegSize);
        tjFree(jpegBuf);

        heif_image_release(img);
        heif_image_handle_release(handle);
        heif_context_free(ctx);
    }

    void OnOK() override {
        Napi::HandleScope scope(Env());
        Napi::Buffer<uint8_t> result = Napi::Buffer<uint8_t>::Copy(Env(), jpegData.data(), jpegData.size());
        Callback().Call({Env().Null(), result});
    }

private:
    Napi::Reference<Napi::Buffer<uint8_t>> bufferRef;
    const uint8_t* data;
    size_t size;
    heif_item_id imageId;
    int quality;
    std::vector<uint8_t> jpegData;
};

class ToPngWorker : public Napi::AsyncWorker {
public:
    ToPngWorker(const Napi::Buffer<uint8_t>& buffer, heif_item_id image_id, const Napi::Object& options, Napi::Function& callback)
        : Napi::AsyncWorker(callback), bufferRef(Napi::Persistent(buffer)), imageId(image_id) {
        data = buffer.Data();
        size = buffer.Length();

        compression = options.Get("compression").As<Napi::Number>().Int32Value();
    }

    ~ToPngWorker() {}

    void Execute() override {
        struct heif_context* ctx = heif_context_alloc();
        struct heif_error err = heif_context_read_from_memory(ctx, data, size, nullptr);
        if (err.code != heif_error_Ok) {
            heif_context_free(ctx);
            SetError("Failed to read HEIF data: " + std::string(err.message));
            return;
        }

        struct heif_image_handle* handle;
        if (imageId == -1) {
            err = heif_context_get_primary_image_handle(ctx, &handle);
        } else {
            err = heif_context_get_image_handle(ctx, imageId, &handle);
        }

        if (err.code != heif_error_Ok) {
            heif_context_free(ctx);
            SetError("Failed to get image handle: " + std::string(err.message));
            return;
        }

        struct heif_image* img;
        err = heif_decode_image(handle, &img, heif_colorspace_RGB, heif_chroma_interleaved_RGB, nullptr);
        if (err.code != heif_error_Ok) {
            heif_image_handle_release(handle);
            heif_context_free(ctx);
            SetError("Failed to decode HEIF image: " + std::string(err.message));
            return;
        }

        int width = heif_image_get_width(img, heif_channel_interleaved);
        int height = heif_image_get_height(img, heif_channel_interleaved);
        int stride;
        const uint8_t* data = heif_image_get_plane_readonly(img, heif_channel_interleaved, &stride);

        std::vector<uint8_t> row(width * 3);

        png_structp png_ptr = png_create_write_struct(PNG_LIBPNG_VER_STRING, nullptr, nullptr, nullptr);
        if (!png_ptr) {
            heif_image_release(img);
            heif_image_handle_release(handle);
            heif_context_free(ctx);
            SetError("Failed to create PNG write struct");
            return;
        }

        png_infop info_ptr = png_create_info_struct(png_ptr);
        if (!info_ptr) {
            png_destroy_write_struct(&png_ptr, nullptr);
            heif_image_release(img);
            heif_image_handle_release(handle);
            heif_context_free(ctx);
            SetError("Failed to create PNG info struct");
            return;
        }

        if (setjmp(png_jmpbuf(png_ptr))) {
            png_destroy_write_struct(&png_ptr, &info_ptr);
            heif_image_release(img);
            heif_image_handle_release(handle);
            heif_context_free(ctx);
            SetError("Error during PNG creation");
            return;
        }

        png_set_IHDR(png_ptr, info_ptr, width, height, 8, PNG_COLOR_TYPE_RGB, PNG_INTERLACE_NONE, PNG_COMPRESSION_TYPE_DEFAULT, PNG_FILTER_TYPE_DEFAULT);

        png_set_compression_level(png_ptr, compression);
        png_set_filter(png_ptr, 0, PNG_FILTER_NONE);

        std::vector<uint8_t> pngData;
        png_set_write_fn(png_ptr, &pngData, [](png_structp png_ptr, png_bytep data, png_size_t length) {
            std::vector<uint8_t>* p = (std::vector<uint8_t>*)png_get_io_ptr(png_ptr);
            p->insert(p->end(), data, data + length);
        }, nullptr);

        png_write_info(png_ptr, info_ptr);

        for (int y = 0; y < height; ++y) {
            memcpy(row.data(), data + y * stride, width * 3);
            png_write_row(png_ptr, row.data());
        }

        png_write_end(png_ptr, nullptr);
        png_destroy_write_struct(&png_ptr, &info_ptr);

        pngBuffer.assign(pngData.begin(), pngData.end());

        heif_image_release(img);
        heif_image_handle_release(handle);
        heif_context_free(ctx);
    }

    void OnOK() override {
        Napi::HandleScope scope(Env());
        Napi::Buffer<uint8_t> result = Napi::Buffer<uint8_t>::Copy(Env(), pngBuffer.data(), pngBuffer.size());
        Callback().Call({Env().Null(), result});
    }

private:
    Napi::Reference<Napi::Buffer<uint8_t>> bufferRef;
    const uint8_t* data;
    size_t size;
    heif_item_id imageId;
    std::vector<uint8_t> pngBuffer;
    int compression;
};

Napi::Value ToJpeg(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Buffer<uint8_t> buffer = info[0].As<Napi::Buffer<uint8_t>>();

    heif_item_id imageId = -1;
    if (info[1].IsNumber()) {
        imageId = info[1].As<Napi::Number>().Uint32Value();
    }

    Napi::Object options = info[2].As<Napi::Object>();
    Napi::Function callback = info[3].As<Napi::Function>();

    ToJpegWorker* worker = new ToJpegWorker(buffer, imageId, options, callback);
    worker->Queue();
    return env.Undefined();
}

Napi::Value ToPng(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Buffer<uint8_t> buffer = info[0].As<Napi::Buffer<uint8_t>>();
    
    heif_item_id imageId = -1;
    if (info[1].IsNumber()) {
        imageId = info[1].As<Napi::Number>().Uint32Value();
    }

    Napi::Object options = info[2].As<Napi::Object>();
    Napi::Function callback = info[3].As<Napi::Function>();

    ToPngWorker* worker = new ToPngWorker(buffer, imageId, options, callback);
    worker->Queue();
    return env.Undefined();
}

Napi::Value ExtractIds(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Buffer<uint8_t> buffer = info[0].As<Napi::Buffer<uint8_t>>();
    const uint8_t* data = buffer.Data();
    size_t size = buffer.Length();

    struct heif_context* ctx = heif_context_alloc();
    if (!ctx) {
        Napi::TypeError::New(env, "Failed to allocate HEIF context").ThrowAsJavaScriptException();
        return env.Null();
    }

    struct heif_error err = heif_context_read_from_memory(ctx, data, size, nullptr);
    if (err.code != heif_error_Ok) {
        heif_context_free(ctx);
        Napi::TypeError::New(env, "Failed to read HEIF data: " + std::string(err.message)).ThrowAsJavaScriptException();
        return env.Null();
    }

    int num_images = heif_context_get_number_of_top_level_images(ctx);
    if (num_images <= 0) {
        heif_context_free(ctx);
        Napi::TypeError::New(env, "No images found in HEIF file").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::vector<heif_item_id> imageIDs(num_images);
    heif_context_get_list_of_top_level_image_IDs(ctx, imageIDs.data(), num_images);

    heif_context_free(ctx);

    Napi::Array result = Napi::Array::New(env, imageIDs.size());
    for (size_t i = 0; i < imageIDs.size(); ++i) {
        result[i] = Napi::Number::New(env, imageIDs[i]);
    }

    return result;
}

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "toPng"), Napi::Function::New(env, ToPng));
    exports.Set(Napi::String::New(env, "toJpeg"), Napi::Function::New(env, ToJpeg));
    exports.Set(Napi::String::New(env, "extractIds"), Napi::Function::New(env, ExtractIds));

    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, InitAll)