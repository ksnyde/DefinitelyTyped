// Type definitions for sharp 0.28
// Project: https://github.com/lovell/sharp
// Definitions by: François Nguyen <https://github.com/lith-light-g>
//                 Wooseop Kim <https://github.com/wooseopkim>
//                 Bradley Odell <https://github.com/BTOdell>
//                 Jamie Woodbury <https://github.com/JamieWoodbury>
//                 Floris de Bijl <https://github.com/Fdebijl>
//                 Billy Kwok <https://github.com/billykwok>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.1

/// <reference types="node" />

import { Duplex } from "stream";

//#region Constructor functions

/**
 * Creates a sharp instance from an image
 * @param input Buffer containing JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF or raw pixel image data, or String containing the path to an JPEG, PNG, WebP, AVIF, GIF, SVG or TIFF image file.
 * @param options Object with optional attributes.
 * @throws {Error} Invalid parameters
 * @returns A sharp instance that can be used to chain operations
 */
declare function sharp(options?: sharp.SharpOptions): sharp.Sharp;
declare function sharp(input?: string | Buffer, options?: sharp.SharpOptions): sharp.Sharp;

declare namespace sharp {
    /** Object containing nested boolean values representing the available input and output formats/methods. */
    const format: FormatEnum;

    /** An Object containing the version numbers of libvips and its dependencies. */
    const versions: {
        vips: string;
        cairo?: string;
        croco?: string;
        exif?: string;
        expat?: string;
        ffi?: string;
        fontconfig?: string;
        freetype?: string;
        gdkpixbuf?: string;
        gif?: string;
        glib?: string;
        gsf?: string;
        harfbuzz?: string;
        jpeg?: string;
        lcms?: string;
        orc?: string;
        pango?: string;
        pixman?: string;
        png?: string;
        svg?: string;
        tiff?: string;
        webp?: string;
        avif?: string;
        heif?: string;
        xml?: string;
        zlib?: string;
    };

    /** An EventEmitter that emits a change event when a task is either queued, waiting for libuv to provide a worker thread, complete */
    const queue: NodeJS.EventEmitter;

    //#endregion

    //#region Utility functions

    /**
     * Gets or, when options are provided, sets the limits of libvips' operation cache.
     * Existing entries in the cache will be trimmed after any change in limits.
     * This method always returns cache statistics, useful for determining how much working memory is required for a particular task.
     * @param options Object with the following attributes, or Boolean where true uses default cache settings and false removes all caching (optional, default true)
     * @returns The cache results.
     */
    function cache(options?: boolean | CacheOptions): CacheResult;

    /**
     * Gets or sets the number of threads libvips' should create to process each image.
     * The default value is the number of CPU cores. A value of 0 will reset to this default.
     * The maximum number of images that can be processed in parallel is limited by libuv's UV_THREADPOOL_SIZE environment variable.
     * @param concurrency The new concurrency value.
     * @returns The current concurrency value.
     */
    function concurrency(concurrency?: number): number;

    /**
     * Provides access to internal task counters.
     * @returns Object containing task counters
     */
    function counters(): SharpCounters;

    /**
     * Get and set use of SIMD vector unit instructions. Requires libvips to have been compiled with liborc support.
     * Improves the performance of resize, blur and sharpen operations by taking advantage of the SIMD vector unit of the CPU, e.g. Intel SSE and ARM NEON.
     * @param enable enable or disable use of SIMD vector unit instructions
     * @returns true if usage of SIMD vector unit instructions is enabled
     */
    function simd(enable?: boolean): boolean;

    //#endregion

    const gravity: GravityEnum;
    const strategy: StrategyEnum;
    const kernel: KernelEnum;
    const fit: FitEnum;
    const bool: BoolEnum;

    interface Sharp extends Duplex {
        //#region Channel functions

        /**
         * Remove alpha channel, if any. This is a no-op if the image does not have an alpha channel.
         * @returns A sharp instance that can be used to chain operations
         */
        removeAlpha(): Sharp;

        /**
         * Ensure alpha channel, if missing. The added alpha channel will be fully opaque. This is a no-op if the image already has an alpha channel.
         * @param alpha transparency level (0=fully-transparent, 1=fully-opaque) (optional, default 1).
         * @returns A sharp instance that can be used to chain operations
         */
        ensureAlpha(alpha?: number): Sharp;

        /**
         * Extract a single channel from a multi-channel image.
         * @param channel zero-indexed band number to extract, or red, green or blue as alternative to 0, 1 or 2 respectively.
         * @throws {Error} Invalid channel
         * @returns A sharp instance that can be used to chain operations
         */
        extractChannel(channel: number | string): Sharp;

        /**
         * Join one or more channels to the image. The meaning of the added channels depends on the output colourspace, set with toColourspace().
         * By default the output image will be web-friendly sRGB, with additional channels interpreted as alpha channels. Channel ordering follows vips convention:
         *  - sRGB: 0: Red, 1: Green, 2: Blue, 3: Alpha.
         *  - CMYK: 0: Magenta, 1: Cyan, 2: Yellow, 3: Black, 4: Alpha.
         *
         * Buffers may be any of the image formats supported by sharp.
         * For raw pixel input, the options object should contain a raw attribute, which follows the format of the attribute of the same name in the sharp() constructor.
         * @param images one or more images (file paths, Buffers).
         * @param options image options, see sharp() constructor.
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        joinChannel(images: string | Buffer | ArrayLike<string | Buffer>, options?: SharpOptions): Sharp;

        /**
         * Perform a bitwise boolean operation on all input image channels (bands) to produce a single channel output image.
         * @param boolOp one of "and", "or" or "eor" to perform that bitwise operation, like the C logic operators &, | and ^ respectively.
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        bandbool(boolOp: string): Sharp;

        //#endregion

        //#region Color functions

        /**
         * Tint the image using the provided chroma while preserving the image luminance.
         * An alpha channel may be present and will be unchanged by the operation.
         * @param rgb Parsed by the color module to extract chroma values.
         * @returns A sharp instance that can be used to chain operations
         */
        tint(rgb: Color): Sharp;

        /**
         * Convert to 8-bit greyscale; 256 shades of grey.
         * This is a linear operation.
         * If the input image is in a non-linear colour space such as sRGB, use gamma() with greyscale() for the best results.
         * By default the output image will be web-friendly sRGB and contain three (identical) color channels.
         * This may be overridden by other sharp operations such as toColourspace('b-w'), which will produce an output image containing one color channel.
         * An alpha channel may be present, and will be unchanged by the operation.
         * @param greyscale true to enable and false to disable (defaults to true)
         * @returns A sharp instance that can be used to chain operations
         */
        greyscale(greyscale?: boolean): Sharp;

        /**
         * Alternative spelling of greyscale().
         * @param grayscale true to enable and false to disable (defaults to true)
         * @returns A sharp instance that can be used to chain operations
         */
        grayscale(grayscale?: boolean): Sharp;

        /**
         * Set the output colourspace.
         * By default output image will be web-friendly sRGB, with additional channels interpreted as alpha channels.
         * @param colourspace output colourspace e.g. srgb, rgb, cmyk, lab, b-w ...
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        toColourspace(colourspace?: string): Sharp;

        /**
         * Alternative spelling of toColourspace().
         * @param colorspace output colorspace e.g. srgb, rgb, cmyk, lab, b-w ...
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        toColorspace(colorspace: string): Sharp;

        //#endregion

        //#region Composite functions

        /**
         * Composite image(s) over the processed (resized, extracted etc.) image.
         *
         * The images to composite must be the same size or smaller than the processed image.
         * If both `top` and `left` options are provided, they take precedence over `gravity`.
         * @param images - Ordered list of images to composite
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        composite(images: OverlayOptions[]): Sharp;

        //#endregion

        //#region Input functions

        /**
         * Take a "snapshot" of the Sharp instance, returning a new instance.
         * Cloned instances inherit the input of their parent instance.
         * This allows multiple output Streams and therefore multiple processing pipelines to share a single input Stream.
         * @returns A sharp instance that can be used to chain operations
         */
        clone(): Sharp;

        /**
         * Fast access to (uncached) image metadata without decoding any compressed image data.
         * @returns A sharp instance that can be used to chain operations
         */
        metadata(callback: (err: Error, metadata: Metadata) => void): Sharp;

        /**
         * Fast access to (uncached) image metadata without decoding any compressed image data.
         * @returns A promise that resolves with a metadata object
         */
        metadata(): Promise<Metadata>;

        /**
         * Access to pixel-derived image statistics for every channel in the image.
         * @returns A sharp instance that can be used to chain operations
         */
        stats(callback: (err: Error, stats: Stats) => void): Sharp;

        /**
         * Access to pixel-derived image statistics for every channel in the image.
         * @returns A promise that resolves with a stats object
         */
        stats(): Promise<Stats>;

        //#endregion

        //#region Operation functions

        /**
         * Rotate the output image by either an explicit angle or auto-orient based on the EXIF Orientation tag.
         *
         * If an angle is provided, it is converted to a valid positive degree rotation. For example, -450 will produce a 270deg rotation.
         *
         * When rotating by an angle other than a multiple of 90, the background colour can be provided with the background option.
         *
         * If no angle is provided, it is determined from the EXIF data. Mirroring is supported and may infer the use of a flip operation.
         *
         * The use of rotate implies the removal of the EXIF Orientation tag, if any.
         *
         * Method order is important when both rotating and extracting regions, for example rotate(x).extract(y) will produce a different result to extract(y).rotate(x).
         * @param angle angle of rotation. (optional, default auto)
         * @param options if present, is an Object with optional attributes.
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        rotate(angle?: number, options?: RotateOptions): Sharp;

        /**
         * Flip the image about the vertical Y axis. This always occurs after rotation, if any.
         * The use of flip implies the removal of the EXIF Orientation tag, if any.
         * @param flip true to enable and false to disable (defaults to true)
         * @returns A sharp instance that can be used to chain operations
         */
        flip(flip?: boolean): Sharp;

        /**
         * Flop the image about the horizontal X axis. This always occurs after rotation, if any.
         * The use of flop implies the removal of the EXIF Orientation tag, if any.
         * @param flop true to enable and false to disable (defaults to true)
         * @returns A sharp instance that can be used to chain operations
         */
        flop(flop?: boolean): Sharp;

        /**
         * Sharpen the image.
         * When used without parameters, performs a fast, mild sharpen of the output image.
         * When a sigma is provided, performs a slower, more accurate sharpen of the L channel in the LAB colour space.
         * Separate control over the level of sharpening in "flat" and "jagged" areas is available.
         * @param sigma the sigma of the Gaussian mask, where sigma = 1 + radius / 2.
         * @param flat the level of sharpening to apply to "flat" areas. (optional, default 1.0)
         * @param jagged the level of sharpening to apply to "jagged" areas. (optional, default 2.0)
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        sharpen(sigma?: number, flat?: number, jagged?: number): Sharp;

        /**
         * Apply median filter. When used without parameters the default window is 3x3.
         * @param size square mask size: size x size (optional, default 3)
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        median(size?: number): Sharp;

        /**
         * Blur the image.
         * When used without parameters, performs a fast, mild blur of the output image.
         * When a sigma is provided, performs a slower, more accurate Gaussian blur.
         * When a boolean sigma is provided, ether blur mild or disable blur
         * @param sigma a value between 0.3 and 1000 representing the sigma of the Gaussian mask, where sigma = 1 + radius / 2.
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        blur(sigma?: number | boolean): Sharp;

        /**
         * Merge alpha transparency channel, if any, with background.
         * @param flatten true to enable and false to disable (defaults to true)
         * @returns A sharp instance that can be used to chain operations
         */
        flatten(flatten?: boolean | FlattenOptions): Sharp;

        /**
         * Apply a gamma correction by reducing the encoding (darken) pre-resize at a factor of 1/gamma then increasing the encoding (brighten) post-resize at a factor of gamma.
         * This can improve the perceived brightness of a resized image in non-linear colour spaces.
         * JPEG and WebP input images will not take advantage of the shrink-on-load performance optimisation when applying a gamma correction.
         * @param gamma value between 1.0 and 3.0. (optional, default 2.2)
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        gamma(gamma?: number): Sharp;

        /**
         * Produce the "negative" of the image.
         * @param negate true to enable and false to disable (defaults to true)
         * @returns A sharp instance that can be used to chain operations
         */
        negate(negate?: boolean): Sharp;

        /**
         * Enhance output image contrast by stretching its luminance to cover the full dynamic range.
         * @param normalise true to enable and false to disable (defaults to true)
         * @returns A sharp instance that can be used to chain operations
         */
        normalise(normalise?: boolean): Sharp;

        /**
         * Alternative spelling of normalise.
         * @param normalize true to enable and false to disable (defaults to true)
         * @returns A sharp instance that can be used to chain operations
         */
        normalize(normalize?: boolean): Sharp;

        /**
         * Perform contrast limiting adaptive histogram equalization (CLAHE)
         *
         * This will, in general, enhance the clarity of the image by bringing out
         * darker details. Please read more about CLAHE here:
         * https://en.wikipedia.org/wiki/Adaptive_histogram_equalization#Contrast_Limited_AHE
         *
         * @param options clahe options
         */
        clahe(options: ClaheOptions): Sharp;

        /**
         * Convolve the image with the specified kernel.
         * @param kernel the specified kernel
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        convolve(kernel: Kernel): Sharp;

        /**
         * Any pixel value greather than or equal to the threshold value will be set to 255, otherwise it will be set to 0.
         * @param threshold a value in the range 0-255 representing the level at which the threshold will be applied. (optional, default 128)
         * @param options threshold options
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        threshold(threshold?: number, options?: ThresholdOptions): Sharp;

        /**
         * Perform a bitwise boolean operation with operand image.
         * This operation creates an output image where each pixel is the result of the selected bitwise boolean operation between the corresponding pixels of the input images.
         * @param operand Buffer containing image data or String containing the path to an image file.
         * @param operator one of "and", "or" or "eor" to perform that bitwise operation, like the C logic operators &, | and ^ respectively.
         * @param options describes operand when using raw pixel data.
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        boolean(operand: string | Buffer, operator: string, options?: { raw: Raw }): Sharp;

        /**
         * Apply the linear formula a * input + b to the image (levels adjustment)
         * @param a multiplier (optional, default 1.0)
         * @param b offset (optional, default 0.0)
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        linear(a?: number | null, b?: number): Sharp;

        /**
         * Recomb the image with the specified matrix.
         * @param inputMatrix 3x3 Recombination matrix
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        recomb(inputMatrix: Matrix3x3): Sharp;

        /**
         * Transforms the image using brightness, saturation and hue rotation.
         * @param options describes the modulation
         * @returns A sharp instance that can be used to chain operations
         */
        modulate(options?: { brightness?: number; saturation?: number; hue?: number }): Sharp;

        //#endregion

        //#region Output functions

        /**
         * Write output image data to a file.
         * If an explicit output format is not selected, it will be inferred from the extension, with JPEG, PNG, WebP, AVIF, TIFF, DZI, and libvips' V format supported.
         * Note that raw pixel data is only supported for buffer output.
         * @param fileOut The path to write the image data to.
         * @param callback Callback function called on completion with two arguments (err, info).  info contains the output image format, size (bytes), width, height and channels.
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        toFile(fileOut: string, callback: (err: Error, info: OutputInfo) => void): Sharp;

        /**
         * Write output image data to a file.
         * @param fileOut The path to write the image data to.
         * @throws {Error} Invalid parameters
         * @returns A promise that fulfills with an object containing information on the resulting file
         */
        toFile(fileOut: string): Promise<OutputInfo>;

        /**
         * Write output to a Buffer. JPEG, PNG, WebP, AVIF, TIFF and RAW output are supported.
         * By default, the format will match the input image, except GIF and SVG input which become PNG output.
         * @param callback Callback function called on completion with three arguments (err, buffer, info).
         * @returns A sharp instance that can be used to chain operations
         */
        toBuffer(callback: (err: Error, buffer: Buffer, info: OutputInfo) => void): Sharp;

        /**
         * Write output to a Buffer. JPEG, PNG, WebP, AVIF, TIFF and RAW output are supported.
         * By default, the format will match the input image, except GIF and SVG input which become PNG output.
         * @param options resolve options
         * @param options.resolveWithObject Resolve the Promise with an Object containing data and info properties instead of resolving only with data.
         * @returns A promise that resolves with the Buffer data.
         */
        toBuffer(options?: { resolveWithObject: false }): Promise<Buffer>;

        /**
         * Write output to a Buffer. JPEG, PNG, WebP, AVIF, TIFF and RAW output are supported.
         * By default, the format will match the input image, except GIF and SVG input which become PNG output.
         * @param options resolve options
         * @param options.resolveWithObject Resolve the Promise with an Object containing data and info properties instead of resolving only with data.
         * @returns A promise that resolves with an object containing the Buffer data and an info object containing the output image format, size (bytes), width, height and channels
         */
        toBuffer(options: { resolveWithObject: true }): Promise<{ data: Buffer; info: OutputInfo }>;

        /**
         * Include all metadata (EXIF, XMP, IPTC) from the input image in the output image.
         * The default behaviour, when withMetadata is not used, is to strip all metadata and convert to the device-independent sRGB colour space.
         * This will also convert to and add a web-friendly sRGB ICC profile.
         * @param withMetadata
         * @throws {Error} Invalid parameters.
         */
        /* tslint:disable-next-line:no-unnecessary-generics */
        withMetadata<T0 extends object = {}, T1 extends object = {}>(withMetadata?: WriteableMetadata<T0, T1>): Sharp;

        /**
         * Use these JPEG options for output image.
         * @param options Output options.
         * @throws {Error} Invalid options
         * @returns A sharp instance that can be used to chain operations
         */
        jpeg(options?: JpegOptions): Sharp;

        /**
         * Use these PNG options for output image.
         * PNG output is always full colour at 8 or 16 bits per pixel.
         * Indexed PNG input at 1, 2 or 4 bits per pixel is converted to 8 bits per pixel.
         * @param options Output options.
         * @throws {Error} Invalid options
         * @returns A sharp instance that can be used to chain operations
         */
        png(options?: PngOptions): Sharp;

        /**
         * Use these WebP options for output image.
         * @param options Output options.
         * @throws {Error} Invalid options
         * @returns A sharp instance that can be used to chain operations
         */
        webp(options?: WebpOptions): Sharp;

        /**
         * Use these AVIF options for output image.
         * Whilst it is possible to create AVIF images smaller than 16x16 pixels, most web browsers do not display these properly.
         * @param options Output options.
         * @throws {Error} Invalid options
         * @returns A sharp instance that can be used to chain operations
         */
        avif(options?: AvifOptions): Sharp;

        /**
         * Use these HEIF options for output image.
         * Support for patent-encumbered HEIC images requires the use of a globally-installed libvips compiled with support for libheif, libde265 and x265.
         * @param options Output options.
         * @throws {Error} Invalid options
         * @returns A sharp instance that can be used to chain operations
         */
        heif(options?: HeifOptions): Sharp;

        /**
         * Use these TIFF options for output image.
         * @param options Output options.
         * @throws {Error} Invalid options
         * @returns A sharp instance that can be used to chain operations
         */
        tiff(options?: TiffOptions): Sharp;

        /**
         * Force output to be raw, uncompressed uint8 pixel data.
         * @returns A sharp instance that can be used to chain operations
         */
        raw(): Sharp;

        /**
         * Force output to a given format.
         * @param format a String or an Object with an 'id' attribute
         * @param options output options
         * @throws {Error} Unsupported format or options
         * @returns A sharp instance that can be used to chain operations
         */
        toFormat(
            format: keyof FormatEnum | AvailableFormatInfo,
            options?:
                | OutputOptions
                | JpegOptions
                | PngOptions
                | WebpOptions
                | AvifOptions
                | HeifOptions
                | GifOptions
                | TiffOptions,
        ): Sharp;

        /**
         * Use tile-based deep zoom (image pyramid) output.
         * Set the format and options for tile images via the toFormat, jpeg, png or webp functions.
         * Use a .zip or .szi file extension with toFile to write to a compressed archive file format.
         *
         * Warning: multiple sharp instances concurrently producing tile output can expose a possible race condition in some versions of libgsf.
         * @param tile tile options
         * @throws {Error} Invalid options
         * @returns A sharp instance that can be used to chain operations
         */
        tile(tile?: TileOptions): Sharp;

        //#endregion

        //#region Resize functions

        /**
         * Resize image to width, height or width x height.
         *
         * When both a width and height are provided, the possible methods by which the image should fit these are:
         *  - cover: Crop to cover both provided dimensions (the default).
         *  - contain: Embed within both provided dimensions.
         *  - fill: Ignore the aspect ratio of the input and stretch to both provided dimensions.
         *  - inside: Preserving aspect ratio, resize the image to be as large as possible while ensuring its dimensions are less than or equal to both those specified.
         *  - outside: Preserving aspect ratio, resize the image to be as small as possible while ensuring its dimensions are greater than or equal to both those specified.
         *             Some of these values are based on the object-fit CSS property.
         *
         * When using a fit of cover or contain, the default position is centre. Other options are:
         *  - sharp.position: top, right top, right, right bottom, bottom, left bottom, left, left top.
         *  - sharp.gravity: north, northeast, east, southeast, south, southwest, west, northwest, center or centre.
         *  - sharp.strategy: cover only, dynamically crop using either the entropy or attention strategy. Some of these values are based on the object-position CSS property.
         *
         * The experimental strategy-based approach resizes so one dimension is at its target length then repeatedly ranks edge regions,
         * discarding the edge with the lowest score based on the selected strategy.
         *  - entropy: focus on the region with the highest Shannon entropy.
         *  - attention: focus on the region with the highest luminance frequency, colour saturation and presence of skin tones.
         *
         * Possible interpolation kernels are:
         *  - nearest: Use nearest neighbour interpolation.
         *  - cubic: Use a Catmull-Rom spline.
         *  - lanczos2: Use a Lanczos kernel with a=2.
         *  - lanczos3: Use a Lanczos kernel with a=3 (the default).
         *
         * @param width pixels wide the resultant image should be. Use null or undefined to auto-scale the width to match the height.
         * @param height pixels high the resultant image should be. Use null or undefined to auto-scale the height to match the width.
         * @param options resize options
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        resize(width?: number | null, height?: number | null, options?: ResizeOptions): Sharp;

        /**
         * Shorthand for resize(null, null, options);
         *
         * @param options resize options
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        resize(options: ResizeOptions): Sharp;

        /**
         * Extends/pads the edges of the image with the provided background colour.
         * This operation will always occur after resizing and extraction, if any.
         * @param extend single pixel count to add to all edges or an Object with per-edge counts
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        extend(extend: number | ExtendOptions): Sharp;

        /**
         * Extract a region of the image.
         *  - Use extract() before resize() for pre-resize extraction.
         *  - Use extract() after resize() for post-resize extraction.
         *  - Use extract() before and after for both.
         *
         * @param region The region to extract
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        extract(region: Region): Sharp;

        /**
         * Trim "boring" pixels from all edges that contain values similar to the top-left pixel.
         * The info response Object will contain trimOffsetLeft and trimOffsetTop properties.
         * @param threshold The allowed difference from the top-left pixel, a number greater than zero. (optional, default 10)
         * @throws {Error} Invalid parameters
         * @returns A sharp instance that can be used to chain operations
         */
        trim(threshold?: number): Sharp;

        //#endregion
    }

    interface SharpOptions {
        /**
         * By default halt processing and raise an error when loading invalid images.
         * Set this flag to false if you'd rather apply a "best effort" to decode images,
         * even if the data is corrupt or invalid. (optional, default true)
         * (optional, default true)
         */
        failOnError?: boolean;
        /**
         * Do not process input images where the number of pixels (width x height) exceeds this limit.
         * Assumes image dimensions contained in the input metadata can be trusted.
         * An integral Number of pixels, zero or false to remove limit, true to use default limit of 268402689 (0x3FFF x 0x3FFF). (optional, default 268402689)
         */
        limitInputPixels?: number | boolean;
        /** Set this to true to use sequential rather than random access where possible. This can reduce memory usage and might improve performance on some systems. (optional, default false) */
        sequentialRead?: boolean;
        /** Number representing the DPI for vector images. (optional, default 72) */
        density?: number;
        /** Number of pages to extract for multi-page input (GIF, TIFF, PDF), use -1 for all pages */
        pages?: number;
        /** Page number to start extracting from for multi-page input (GIF, TIFF, PDF), zero based. (optional, default 0) */
        page?: number;
        /** Level to extract from a multi-level input (OpenSlide), zero based. (optional, default 0) */
        level?: number;
        /** Set to `true` to read all frames/pages of an animated image (equivalent of setting `pages` to `-1`). (optional, default false) */
        animated?: boolean;
        /** Describes raw pixel input image data. See raw() for pixel ordering. */
        raw?: Raw;
        /** Describes a new image to be created. */
        create?: Create;
    }

    interface CacheOptions {
        /** Is the maximum memory in MB to use for this cache (optional, default 50) */
        memory?: number;
        /** Is the maximum number of files to hold open (optional, default 20) */
        files?: number;
        /** Is the maximum number of operations to cache (optional, default 100) */
        items?: number;
    }

    interface SharpCounters {
        /** The number of tasks this module has queued waiting for libuv to provide a worker thread from its pool. */
        queue: number;
        /** The number of resize tasks currently being processed. */
        process: number;
    }

    interface Raw {
        width: number;
        height: number;
        channels: 1 | 2 | 3 | 4;
    }

    interface Create {
        /** Number of pixels wide. */
        width: number;
        /** Number of pixels high. */
        height: number;
        /** Number of bands e.g. 3 for RGB, 4 for RGBA */
        channels: Channels;
        /** Parsed by the [color](https://www.npmjs.org/package/color) module to extract values for red, green, blue and alpha. */
        background: Color;
    }

    type ImageOrientation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

    enum ExifFlashValues {
        NoFlash = 0x0,
        Fired = 0x1,
        FiredReturnNotDetected = 0x5,
        FiredReturnDetected = 0x7,
        OnDidNotFire = 0x8,
        OnFired = 0x9,
        OnReturnNotDetected = 0xd,
        OnReturnDetected = 0xf,
        OffDidNotFire = 0x10,
        OffDidNotFireReturnNotDetected = 0x14,
        AutoDidNotFire = 0x18,
        AutoFired = 0x19,
        AutoFiredReturnNotDetected = 0x1d,
        AutoFiredReturnDetected = 0x1f,
        NoFlashFunction = 0x20,
        OffNoFlashFunction = 0x30,
        FiredRedEyeReduction = 0x41,
        FiredRedEyeReductionReturnNotDetected = 0x45,
        FiredRedEyeReductionReturnDetected = 0x47,
        OnRedEyeReduction = 0x49,
        OnRedEyeReductionReturnNotDetected = 0x4d,
        OnRedEyeReductionReturnDetected = 0x4f,
        OffRedEyeReduction = 0x50,
        AutoDidNotFireRedEyeReduction = 0x58,
        AutoFiredRedEyeReduction = 0x59,
        AutoFiredRedEyeReductionNotDetected = 0x59,
        AutoFiredRedEyeReductionDetected = 0x5d,
    }

    enum ExifLightSource {
        Unknown = 0,
        Daylight,
        Flourescent,
        Tungsten,
        Flash,
        FineWeather,
        Cloudy,
        Shade,
        DaylightFlourescent,
        DayWhiteFlourescent,
        CoolWhiteFlourescent,
        WhiteFlourescent,
        WarmWhiteFlourescent,
        StandardLightA,
        StandardLightB,
        StandardLightC,
        D55,
        D65,
        D75,
        D50,
        ISOStudioTungten,
        Other = 255
    }
    /**
     * The EXIF **IFD0** properties. This is meant to be a _reasonable subset_ with an attempt to
     * include the most used. If you wish to extend this type you can simply add more strongly typed
     * key/value pairs as the optional generic `<T>`.
     *
     * This list was created by referencing the very useful docs from [Exiftool](https://exiftool.org/TagNames/EXIF.html)
     * and occational reference to the far drier [EXIF spec](https://web.archive.org/web/20190624045241if_/http://www.cipa.jp:80/std/documents/e/DC-008-Translation-2019-E.pdf).
     */
    type ExifIFD0<T extends {} = {}> = {
        ProcessingSoftware?: string;
        ImageWidth?: number;
        ImageHeight?: number;
        /**
         * - `1` -  Uncompressed
         * - `2` -  CCITT 1D
         * - `3` -  T4/Group 3 Fax
         * - `4` -  T6/Group 4 Fax
         * - `5` -  LZW
         * - `6` -  JPEG (old-style)
         * - `7` -  JPEG
         * - `8` -  Adobe Deflate
         * - `9` -  JBIG B&W
         * - `10` -  JBIG Color
         * - `99` -  JPEG
         * - `262` -  Kodak 262
         * - `32766` -  Next
         * - `32767` -  Sony ARW Compressed
         * - `32769` -  Packed RAW
         * - `32770` -  Samsung SRW Compressed
         * - `32771` -  CCIRLEW
         * - `32772` -  Samsung SRW Compressed 2
         * - `32773` -  PackBits
         * - `32809` -  Thunderscan
         * - `32867` -  Kodak KDC Compressed
         * - `32895` -  IT8CTPAD
         * - `32896` -  IT8LW
         * - `32897` -  IT8MP
         * - `32898` -  IT8BL
         * - `32908` -  PixarFilm
         * - `32909` -  PixarLog
         * - `32946` -  Deflate
         * - `32947` -  DCS
         * - `33003` -  Aperio JPEG 2000 YCbCr
         * - `33005` -  Aperio JPEG 2000 RGB
         * - `34661` -  JBIG
         * - `34676` -  SGILog
         * - `34677` -  SGILog24
         * - `34712` -  JPEG 2000
         * - `34713` -  Nikon NEF Compressed
         * - `34715` -  JBIG2 TIFF FX
         * - `34718` -  Microsoft Document Imaging (MDI) Binary Level Codec
         * - `34719` -  Microsoft Document Imaging (MDI) Progressive Transform Codec
         * - `34720` -  Microsoft Document Imaging (MDI) Vector
         * - `34887` -  ESRI Lerc
         * - `34892` -  Lossy JPEG
         * - `34925` -  LZMA2
         * - `34926` -  Zstd
         * - `34927` -  WebP
         * - `34933` -  PNG
         * - `34934` -  JPEG XR
         * - `65000` -  Kodak DCR Compressed
         * - `65535` -  Pentax PEF Compressed
         */
        Compression?: number;
        /**
         * - `0` - WhiteIsZero
         * - `1` - BlackIsZero
         * - `2` - RGB
         * - `3` - RGB Palette
         * - `4` - Transparency Mask
         * - `5` - CMYK
         * - `6` - YCbCr
         * - `8` - CIELab
         * - `9` - ICCLab
         * - `10` - ITULab
         * - `32803` - Color Filter Array
         * - `32844` - Pixar LogL
         * - `32845` - Pixar LogLuv
         * - `32892` - Sequential Color Filter
         * - `34892` - Linear Raw
         * - `51177` - Depth Map
         */
        PhotometricInterpretation?: number;

        /**
         * - `1` - No dithering or halftoning
         * - `2` - Ordered dither or halftone
         * - `3` - Randomized dither
         */
        Thresholding?: 1 | 2 | 3;

        DocumentName?: string;
        ImageDescription?: string;
        Make?: string;
        Model?: string;
        /**
         * - `1` - Horizontal (normal)
         * - `2` - Mirror horizontal
         * - `3` - Rotate 180
         * - `4` - Mirror vertical
         * - `5` - Mirror horizontal and rotate 270 CW
         * - `6` - Rotate 90 CW
         * - `7` - Mirror horizontal and rotate 90 CW
         * - `8` - Rotate 270 CW
         */
        Orientation?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
        XResolution?: number;
        YResolution?: number;

        Software?: string;
        /** called DateTime by the EXIF spec */
        ModifyDate?: string;
        /** becomes a list-type tag when the MWG module is loaded */
        Artist?: string;
        HostComputer?: string;
        ApplicationNotes?: string;
        Rating?: number;
        RatingPercent?: number;
        PixelScale?: number;
        Copyright?: string;
        PhotoshopSettings?: string;
        XPTitle?: number;
        XPComment?: number;
        XPAuthor?: number;
        XPKeywords?: number;
        XPSubject?: number;
        UniqueCameraModel?: string;
        LocalizedCameraModel?: string;
        CameraSerialNumber?: string;
        CameraLabel?: string;
        CalibrationIlluminant1?: ExifLightSource;
        CalibrationIlluminant2?: ExifLightSource;
        OriginalRawFileName?: string;
        /** refer to [ICC Profile Tags](https://exiftool.org/TagNames/ICC_Profile.html) for literal types */
        AsShotICCProfile?: string;
        /** refer to [ICC Profile Tags](https://exiftool.org/TagNames/ICC_Profile.html) for literal types */
        CurrentICCProfile?: string;
        ColorimetricReference?: number;
        ProfileName?: string;
        /**
         * - `0` - Unknown
         * - `1` - Linear
         * - `2` - Inverse
         */
        DepthFormat?: 0 | 1 | 2;
        DepthNear?: number;
        DepthFar?: number;
        /** The value of `0` represents _unknown_ and `1` is _meters_; there may be others */
        DepthUnits?: number;
        /**
         * - `0` - Unknown
         * - `1` - Optical Axis
         * - `2` - Optical Ray
         */
        DepthMeasureType?: 0 | 1 | 2;
        EnhanceParams?: string;
    } & T;

    /**
     * The EXIF standard derives from two keyvalue sources.
     *
     * 1. The IFD0/1 which largely came from the TIFF metadata standard (and where 0 is for the main image, and 1 is for an embedded thumbnail).
     * 2. The **ExifIFD** standard which was distinct to EXIF.
     *
     * This type represents a useful subset of tags available in EXIF's IFD. It is not meant
     * to represent _all_ properties but you can use the generic `<T>` to extend the typing
     * to other key/values if you need that.
     */
    type ExifIFD<T extends object = {}> = {
        /**
         * - `0` - Not Defined
         * - `1` - Manual
         * - `2` - Program AE
         * - `3` - Aperture-priority AE
         * - `4` - Shutter speed priority AE
         * - `5` - Creative (Slow speed)
         * - `6` - Action (High speed)
         * - `7` - Portrait
         * - `8` - Landscape
         * - `9` - Bulb
         */
        ExposureProgram?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
        /**
         * - `0` - Unknown
         * - `1` - Standard Output Sensitivity
         * - `2` - Recommended Exposure Index
         * - `3` - ISO Speed
         * - `4` - Standard Output Sensitivity and Recommended Exposure Index
         * - `5` - Standard Output Sensitivity and ISO Speed
         * - `6` - Recommended Exposure Index and ISO Speed
         * - `7` - Standard Output Sensitivity, Recommended Exposure Index and ISO Speed
         */
        SensitivityType?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
        StandardOutputSensitivity?: number;
        RecommendedExposureIndex?: number;
        ISOSpeed?: number;
        /** date/time when original image was taken */
        DateTimeOriginal?: string;
        /** called DateTimeDigitized by the EXIF spec */
        CreateDate?: string;
        /** time zone for ModifyDate */
        OffsetTime?: string;
        /** time zone for DateTimeOriginal */
        OffsetTimeOriginal?: string;
        /** time zone for CreateDate */
        OffsetTimeDigitized?: string;
        /** displayed in seconds, but stored as an APEX value */
        ShutterSpeedValue?: number;
        /** displayed as an F number, but stored as an APEX value */
        ApertureValue?: number;
        /** displayed as an F number, but stored as an APEX value */
        MaxAperturValue?: number;
        BrightnessValue?: number;
        /** called ExposureBiasValue by the EXIF spec */
        ExposureCompensation?: number;
        SubjectDistance?: number;
        /**
         * - `0` - Unknown
         * - `1` - Average
         * - `2` - Center-weighted average
         * - `3` - Spot
         * - `4` - Multi-spot
         * - `5` - Multi-segment
         * - `6` - Partial
         * - `255` - Other
         */
        MeteringMode?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 255;
        LightSource?: ExifLightSource;
        /**
         * - `NoFlash` = 0x0,
         * - `Fired` = 0x1,
         * - `FiredReturnNotDetected` = 0x5,
         * - `FiredReturnDetected` = 0x7,
         * - `OnDidNotFire` = 0x8,
         * - `OnFired` = 0x9,
         * - `OnReturnNotDetected` = 0xd,
         * - `OnReturnDetected` = 0xf,
         * - `OffDidNotFire` = 0x10,
         * - `OffDidNotFireReturnNotDetected` = 0x14,
         * - `AutoDidNotFire` = 0x18,
         * - `AutoFired` = 0x19,
         * - `AutoFiredReturnNotDetected` = 0x1d,
         * - `AutoFiredReturnDetected` = 0x1f,
         * - `NoFlashFunction` = 0x20,
         * - `OffNoFlashFunction` = 0x30,
         * - `FiredRedEyeReduction` = 0x41,
         * - `FiredRedEyeReductionReturnNotDetected` = 0x45,
         * - `FiredRedEyeReductionReturnDetected` = 0x47,
         * - `OnRedEyeReduction` = 0x49,
         * - `OnRedEyeReductionReturnNotDetected` = 0x4d,
         * - `OnRedEyeReductionReturnDetected` = 0x4f,
         * - `OffRedEyeReduction` = 0x50,
         * - `AutoDidNotFireRedEyeReduction` = 0x58,
         * - `AutoFiredRedEyeReduction` = 0x59,
         * - `AutoFiredRedEyeReductionNotDetected` = 0x59,
         * - `AutoFiredRedEyeReductionDetected` = 0x5d,
         */
        Flash?: ExifFlashValues;
        UserComment?: string;
        AmbientTemperature?: number;
        Humidity?: number;
        Pressure?: number;
        WaterDepth?: number;
        Acceleration?: number;
        CameraElevationAngle?: number;
        /**
         * - `0x1` = sRGB
         * - `0x2` = Adobe RGB
         * - `0xfffd` = Wide Gamut RGB
         * - `0xfffe` = ICC Profile
         * - `0xffff` = Uncalibrated
         *
         * NOTE: the value of `0x2` is not standard EXIF. Instead, an Adobe RGB image is indicated by
         * "Uncalibrated" with an InteropIndex of "R03". The values 0xfffd and 0xfffe are also non-standard,
         * and are used by some Sony cameras.
         */
        Colorspace?: 0x1 | 0x2 | 0xfffd | 0xfffe | 0xffff;
        /** called PixelXDimension by the EXIF spec. */
        ExifImageWidth?: number;
        /** called PixelYDimension by the EXIF spec */
        ExifImageHeight?: number;
        RelatedSoundFile?: string;

        FlashEnergy?: number;
        SubjectLocation?: [number, number];
        ExposureIndex?: number;
        /**
         * - `1` - Not defined
         * - `2` - One-chip color area
         * - `3` - Two-chip color area
         * - `4` - Three-chip color area
         * - `5` - Color sequential area
         * - `7` - Trilinear
         * - `8` - Color sequential linear
         */
        SensingMethod?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

        /**
         * Only `0` and `1` are standard EXIF but other values are used by Apple iOS devices
         *
         * - `0` - Normal
         * - `1` - Custom
         * - `2` - HDR (no original saved)
         * - `3` - HDR (original saved)
         * - `4` - Original (for HDR)
         * - `6` - Panorama
         * - `7` - Portrait HDR
         * - `8` - Portrait
         */
        CustomRendered?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
        /**
         * - `0` - Auto
         * - `1` - Manual
         * - `2` - Auto bracket
         */
        ExposureMode?: 0 | 1 | 2;
        /**
         * - `0` = Normal
         * - `1` = Low
         * - `2` = High
         */
        Contrast?: 0 | 1 | 2;
        /**
         * - `0` = Normal
         * - `1` = Low
         * - `2` = High
         */
        Saturation?: 0 | 1 | 2;
        /**
         * - `0` = Normal
         * - `1` = Soft
         * - `2` = Hard
         */
        Sharpness?: 0 | 1 | 2;
        /**
         * - `0` = Unknown
         * - `1` = Macro
         * - `2` = Close
         * - `3` = Distant
         */
        SubjectDistanceRange?: 0 | 1 | 2 | 3;
        ImageUniqueId?: string;
        /** CameraOwnerName by the EXIF spec. */
        OwnerName?: string;
        /** called BodySerialNumber by the EXIF spec. */
        SerialNumber?: string;
        /** 4 rational values giving focal and aperture ranges, called LensSpecification by the EXIF spec */
        LensInfo?: [number, number, number, number];
        LensMake?: string;
        LensModel?: string;
        LensSerialNumber?: string;
        /**
         * - `0` - Unknown
         * - `1` - Not a Composite Image
         * - `2` - General Composite Image
         * - `3` - Composite Image Captured While Shooting
         */
        CompositeImage?: 0 | 1 | 2 | 3;
        Gamma?: number;
    } & T;
    interface WriteableMetadata<T0 extends {} = {}, T1 extends {} = {}> {
        /** Value between 1 and 8, used to update the EXIF Orientation tag. */
        orientation?: ImageOrientation;
        /** Filesystem path to output ICC profile, defaults to sRGB. */
        icc?: string;
        /** Object keyed by IFD0, IFD1 etc. of key/value string pairs to write as EXIF data. (optional, default {}) */
        exif?: {
            /**
             * Key/value pairs associated to the main image data
             */
            IFD0?: ExifIFD0<T0> & { [key: string]: any };
            /**
             * Key/value pairs associated to the _optionally_ embedded thumbnail
             */
            IFD1?: T1 & Record<string, any>;
            [key: string]: any;
        };
        /** Number of pixels per inch (DPI) */
        density?: number;
    }

    interface Metadata {
        /** Number value of the EXIF Orientation header, if present */
        orientation?: ImageOrientation;
        /** Name of decoder used to decompress image data e.g. jpeg, png, webp, gif, svg */
        format?: keyof FormatEnum;
        /** Total size of image in bytes, for Stream and Buffer input only */
        size?: number;
        /** Number of pixels wide (EXIF orientation is not taken into consideration) */
        width?: number;
        /** Number of pixels high (EXIF orientation is not taken into consideration) */
        height?: number;
        /** Name of colour space interpretation */
        space?: keyof ColourspaceEnum;
        /** Number of bands e.g. 3 for sRGB, 4 for CMYK */
        channels?: Channels;
        /** Name of pixel depth format e.g. uchar, char, ushort, float ... */
        depth?: string;
        /** Number of pixels per inch (DPI), if present */
        density?: number;
        /** String containing JPEG chroma subsampling, 4:2:0 or 4:4:4 for RGB, 4:2:0:4 or 4:4:4:4 for CMYK */
        chromaSubsampling: string;
        /** Boolean indicating whether the image is interlaced using a progressive scan */
        isProgressive?: boolean;
        /** Number of pages/frames contained within the image, with support for TIFF, HEIF, PDF, animated GIF and animated WebP */
        pages?: number;
        /** Number of pixels high each page in a multi-page image will be. */
        pageHeight?: number;
        /** Number of times to loop an animated image, zero refers to a continuous loop. */
        loop?: number;
        /** Delay in ms between each page in an animated image, provided as an array of integers. */
        delay?: number[];
        /**  Number of the primary page in a HEIF image */
        pagePrimary?: number;
        /** Boolean indicating the presence of an embedded ICC profile */
        hasProfile?: boolean;
        /** Boolean indicating the presence of an alpha transparency channel */
        hasAlpha?: boolean;
        /** Buffer containing raw EXIF data, if present */
        exif?: Buffer;
        /** Buffer containing raw ICC profile data, if present */
        icc?: Buffer;
        /** Buffer containing raw IPTC data, if present */
        iptc?: Buffer;
        /** Buffer containing raw XMP data, if present */
        xmp?: Buffer;
        /** Buffer containing raw TIFFTAG_PHOTOSHOP data, if present */
        tifftagPhotoshop?: Buffer;
    }

    interface Stats {
        /** Array of channel statistics for each channel in the image. */
        channels: ChannelStats[];
        /** Value to identify if the image is opaque or transparent, based on the presence and use of alpha channel */
        isOpaque: boolean;
        /** Histogram-based estimation of greyscale entropy, discarding alpha channel if any (experimental) */
        entropy: number;
        /** Estimation of greyscale sharpness based on the standard deviation of a Laplacian convolution, discarding alpha channel if any (experimental) */
        sharpness: number;
        /** Object containing most dominant sRGB colour based on a 4096-bin 3D histogram (experimental) */
        dominant: { r: number; g: number; b: number };
    }

    interface ChannelStats {
        /** minimum value in the channel */
        min: number;
        /** maximum value in the channel */
        max: number;
        /** sum of all values in a channel */
        sum: number;
        /** sum of squared values in a channel */
        squaresSum: number;
        /** mean of the values in a channel */
        mean: number;
        /** standard deviation for the values in a channel */
        stdev: number;
        /** x-coordinate of one of the pixel where the minimum lies */
        minX: number;
        /** y-coordinate of one of the pixel where the minimum lies */
        minY: number;
        /** x-coordinate of one of the pixel where the maximum lies */
        maxX: number;
        /** y-coordinate of one of the pixel where the maximum lies */
        maxY: number;
    }

    interface OutputOptions {
        /** Force format output, otherwise attempt to use input format (optional, default true) */
        force?: boolean;
    }

    interface JpegOptions extends OutputOptions {
        /** Quality, integer 1-100 (optional, default 80) */
        quality?: number;
        /** Use progressive (interlace) scan (optional, default false) */
        progressive?: boolean;
        /** Set to '4:4:4' to prevent chroma subsampling when quality <= 90 (optional, default '4:2:0') */
        chromaSubsampling?: string;
        /** Apply trellis quantisation (optional, default  false) */
        trellisQuantisation?: boolean;
        /** Apply overshoot deringing (optional, default  false) */
        overshootDeringing?: boolean;
        /** Optimise progressive scans, forces progressive (optional, default false) */
        optimiseScans?: boolean;
        /** Alternative spelling of optimiseScans (optional, default false) */
        optimizeScans?: boolean;
        /** Optimise Huffman coding tables (optional, default true) */
        optimiseCoding?: boolean;
        /** Alternative spelling of optimiseCoding (optional, default true) */
        optimizeCoding?: boolean;
        /** Quantization table to use, integer 0-8 (optional, default 0) */
        quantisationTable?: number;
        /** Alternative spelling of quantisationTable (optional, default 0) */
        quantizationTable?: number;
        /** Use mozjpeg defaults (optional, default false) */
        mozjpeg?: boolean;
    }

    interface WebpOptions extends OutputOptions, AnimationOptions {
        /** Quality, integer 1-100 (optional, default 80) */
        quality?: number;
        /** Quality of alpha layer, number from 0-100 (optional, default 100) */
        alphaQuality?: number;
        /** Use lossless compression mode (optional, default false) */
        lossless?: boolean;
        /** Use near_lossless compression mode (optional, default false) */
        nearLossless?: boolean;
        /** Use high quality chroma subsampling (optional, default false) */
        smartSubsample?: boolean;
        /** Level of CPU effort to reduce file size, integer 0-6 (optional, default 4) */
        reductionEffort?: number;
    }

    interface AvifOptions extends OutputOptions {
        /** quality, integer 1-100 (optional, default 50) */
        quality?: number;
        /** use lossless compression (optional, default false) */
        lossless?: boolean;
        /** CPU effort vs file size, 0 (slowest/smallest) to 8 (fastest/largest) (optional, default 5) */
        speed?: number;
    }

    interface HeifOptions extends OutputOptions {
        /** quality, integer 1-100 (optional, default 50) */
        quality?: number;
        /** compression format: av1, hevc (optional, default 'av1') */
        compression?: "av1" | "hevc";
        /** use lossless compression (optional, default false) */
        lossless?: boolean;
        /** CPU effort vs file size, 0 (slowest/smallest) to 8 (fastest/largest) (optional, default 5) */
        speed?: number;
    }

    /**
     * Requires libvips compiled with support for ImageMagick or GraphicsMagick.
     * The prebuilt binaries do not include this - see
     * {@link https://sharp.pixelplumbing.com/install#custom-libvips installing a custom libvips}.
     */
    interface GifOptions extends OutputOptions, AnimationOptions { }

    interface TiffOptions extends OutputOptions {
        /** Quality, integer 1-100 (optional, default 80) */
        quality?: number;
        /** Compression options: lzw, deflate, jpeg, ccittfax4 (optional, default 'jpeg') */
        compression?: string;
        /** Compression predictor options: none, horizontal, float (optional, default 'horizontal') */
        predictor?: string;
        /** Write an image pyramid (optional, default false) */
        pyramid?: boolean;
        /** Write a tiled tiff (optional, default false) */
        tile?: boolean;
        /** Horizontal tile size (optional, default 256) */
        tileWidth?: boolean;
        /** Vertical tile size (optional, default 256) */
        tileHeight?: boolean;
        /** Horizontal resolution in pixels/mm (optional, default 1.0) */
        xres?: number;
        /** Vertical resolution in pixels/mm (optional, default 1.0) */
        yres?: number;
        /** Reduce bitdepth to 1, 2 or 4 bit (optional, default 8) */
        bitdepth?: 1 | 2 | 4 | 8;
    }

    interface PngOptions extends OutputOptions {
        /** Use progressive (interlace) scan (optional, default false) */
        progressive?: boolean;
        /** zlib compression level, 0-9 (optional, default 6) */
        compressionLevel?: number;
        /** use adaptive row filtering (optional, default false) */
        adaptiveFiltering?: boolean;
        /** use the lowest number of colours needed to achieve given quality (optional, default `100`) */
        quality?: number;
        /** Quantise to a palette-based image with alpha transparency support (optional, default false) */
        palette?: boolean;
        /** Maximum number of palette entries (optional, default 256) */
        colours?: number;
        /** Alternative Spelling of "colours". Maximum number of palette entries (optional, default 256) */
        colors?: number;
        /**  Level of Floyd-Steinberg error diffusion (optional, default 1.0) */
        dither?: number;
    }

    interface RotateOptions {
        /** parsed by the color module to extract values for red, green, blue and alpha. (optional, default "#000000") */
        background?: Color;
    }

    interface FlattenOptions {
        /** background colour, parsed by the color module, defaults to black. (optional, default {r:0,g:0,b:0}) */
        background?: Color;
    }

    interface ResizeOptions {
        /** Alternative means of specifying width. If both are present this take priority. */
        width?: number;
        /** Alternative means of specifying height. If both are present this take priority. */
        height?: number;
        /** How the image should be resized to fit both provided dimensions, one of cover, contain, fill, inside or outside. (optional, default 'cover') */
        fit?: keyof FitEnum;
        /** Position, gravity or strategy to use when fit is cover or contain. (optional, default 'centre') */
        position?: number | string;
        /** Background colour when using a fit of contain, parsed by the color module, defaults to black without transparency. (optional, default {r:0,g:0,b:0,alpha:1}) */
        background?: Color;
        /** The kernel to use for image reduction. (optional, default 'lanczos3') */
        kernel?: keyof KernelEnum;
        /** Do not enlarge if the width or height are already less than the specified dimensions, equivalent to GraphicsMagick's > geometry option. (optional, default false) */
        withoutEnlargement?: boolean;
        /** Take greater advantage of the JPEG and WebP shrink-on-load feature, which can lead to a slight moiré pattern on some images. (optional, default true) */
        fastShrinkOnLoad?: boolean;
    }

    interface Region {
        /** zero-indexed offset from left edge */
        left: number;
        /** zero-indexed offset from top edge */
        top: number;
        /** dimension of extracted image */
        width: number;
        /** dimension of extracted image */
        height: number;
    }

    interface ExtendOptions {
        /** single pixel count to top edge (optional, default 0) */
        top?: number;
        /** single pixel count to left edge (optional, default 0) */
        left?: number;
        /** single pixel count to bottom edge (optional, default 0) */
        bottom?: number;
        /** single pixel count to right edge (optional, default 0) */
        right?: number;
        /** background colour, parsed by the color module, defaults to black without transparency. (optional, default {r:0,g:0,b:0,alpha:1}) */
        background?: Color;
    }

    /** 3 for sRGB, 4 for CMYK */
    type Channels = 3 | 4;

    interface RGBA {
        r?: number;
        g?: number;
        b?: number;
        alpha?: number;
    }

    type Color = string | RGBA;

    interface Kernel {
        /** width of the kernel in pixels. */
        width: number;
        /** height of the kernel in pixels. */
        height: number;
        /** Array of length width*height containing the kernel values. */
        kernel: ArrayLike<number>;
        /** the scale of the kernel in pixels. (optional, default sum) */
        scale?: number;
        /** the offset of the kernel in pixels. (optional, default 0) */
        offset?: number;
    }

    interface ClaheOptions {
        /** width of the region */
        width: number;
        /** height of the region */
        height: number;
        /** max slope of the cumulative contrast. (optional, default 3) */
        maxSlope?: number;
    }

    interface ThresholdOptions {
        /** convert to single channel greyscale. (optional, default true) */
        greyscale?: boolean;
        /** alternative spelling for greyscale. (optional, default true) */
        grayscale?: boolean;
    }

    interface OverlayOptions {
        /** Buffer containing image data, String containing the path to an image file, or Create object  */
        input?: string | Buffer | { create: Create };
        /** how to blend this image with the image below. (optional, default `'over'`) */
        blend?: Blend;
        /** gravity at which to place the overlay. (optional, default 'centre') */
        gravity?: Gravity;
        /** the pixel offset from the top edge. */
        top?: number;
        /** the pixel offset from the left edge. */
        left?: number;
        /** set to true to repeat the overlay image across the entire image with the given  gravity. (optional, default false) */
        tile?: boolean;
        /** number representing the DPI for vector overlay image. (optional, default 72) */
        density?: number;
        /** describes overlay when using raw pixel data. */
        raw?: Raw;
        /** Set to true to avoid premultipling the image below. Equivalent to the --premultiplied vips option. */
        premultiplied?: boolean;
        /**
         * Do not process input images where the number of pixels (width x height) exceeds this limit.
         * Assumes image dimensions contained in the input metadata can be trusted.
         * An integral Number of pixels, zero or false to remove limit, true to use default limit of 268402689 (0x3FFF x 0x3FFF). (optional, default 268402689)
         */
        limitInputPixels?: number | boolean;
    }

    interface TileOptions {
        /** Tile size in pixels, a value between 1 and 8192. (optional, default 256) */
        size?: number;
        /** Tile overlap in pixels, a value between 0 and 8192. (optional, default 0) */
        overlap?: number;
        /** Tile angle of rotation, must be a multiple of 90. (optional, default 0) */
        angle?: number;
        /** background colour, parsed by the color module, defaults to white without transparency. (optional, default {r:255,g:255,b:255,alpha:1}) */
        background?: string | RGBA;
        /** How deep to make the pyramid, possible values are "onepixel", "onetile" or "one" (default based on layout) */
        depth?: string;
        /** Threshold to skip tile generation, a value 0 - 255 for 8-bit images or 0 - 65535 for 16-bit images */
        skipBlanks?: number;
        /** Tile container, with value fs (filesystem) or zip (compressed file). (optional, default 'fs') */
        container?: string;
        /** Filesystem layout, possible values are dz, iiif, zoomify or google. (optional, default 'dz') */
        layout?: TileLayout;
    }

    interface AnimationOptions {
        /** Page height for animated output, a value greater than 0. (optional) */
        pageHeight?: number;
        /** Number of animation iterations, a value between 0 and 65535. Use 0 for infinite animation. (optional, default 0) */
        loop?: number;
        /** List of delays between animation frames (in milliseconds), each value between 0 and 65535. (optional) */
        delay?: number[];
    }

    interface OutputInfo {
        format: string;
        size: number;
        width: number;
        height: number;
        channels: number;
        /** indicating if premultiplication was used */
        premultiplied: boolean;
        /** Only defined when using a crop strategy */
        cropOffsetLeft?: number;
        /** Only defined when using a crop strategy */
        cropOffsetTop?: number;
        /** Only defined when using a trim method */
        trimOffsetLeft?: number;
        /** Only defined when using a trim method */
        trimOffsetTop?: number;
    }

    interface AvailableFormatInfo {
        id: string;
        input: { file: boolean; buffer: boolean; stream: boolean };
        output: { file: boolean; buffer: boolean; stream: boolean };
    }

    interface FitEnum {
        contain: "contain";
        cover: "cover";
        fill: "fill";
        inside: "inside";
        outside: "outside";
    }

    interface KernelEnum {
        nearest: "nearest";
        cubic: "cubic";
        mitchell: "mitchell";
        lanczos2: "lanczos2";
        lanczos3: "lanczos3";
    }

    interface BoolEnum {
        and: "and";
        or: "or";
        eor: "eor";
    }

    interface ColourspaceEnum {
        multiband: string;
        "b-w": string;
        bw: string;
        cmyk: string;
        srgb: string;
    }

    type TileLayout = "dz" | "iiif" | "zoomify" | "google";

    type Blend =
        | "clear"
        | "source"
        | "over"
        | "in"
        | "out"
        | "atop"
        | "dest"
        | "dest-over"
        | "dest-in"
        | "dest-out"
        | "dest-atop"
        | "xor"
        | "add"
        | "saturate"
        | "multiply"
        | "screen"
        | "overlay"
        | "darken"
        | "lighten"
        | "colour-dodge"
        | "colour-dodge"
        | "colour-burn"
        | "colour-burn"
        | "hard-light"
        | "soft-light"
        | "difference"
        | "exclusion";

    type Gravity = number | string;

    interface GravityEnum {
        north: number;
        northeast: number;
        southeast: number;
        south: number;
        southwest: number;
        west: number;
        northwest: number;
        east: number;
        center: number;
        centre: number;
    }

    interface StrategyEnum {
        entropy: number;
        attention: number;
    }

    interface FormatEnum {
        avif: AvailableFormatInfo;
        dz: AvailableFormatInfo;
        fits: AvailableFormatInfo;
        gif: AvailableFormatInfo;
        heif: AvailableFormatInfo;
        input: AvailableFormatInfo;
        jpeg: AvailableFormatInfo;
        jpg: AvailableFormatInfo;
        magick: AvailableFormatInfo;
        openslide: AvailableFormatInfo;
        pdf: AvailableFormatInfo;
        png: AvailableFormatInfo;
        ppm: AvailableFormatInfo;
        raw: AvailableFormatInfo;
        svg: AvailableFormatInfo;
        tiff: AvailableFormatInfo;
        v: AvailableFormatInfo;
        webp: AvailableFormatInfo;
    }

    interface CacheResult {
        memory: { current: number; high: number; max: number };
        files: { current: number; max: number };
        items: { current: number; max: number };
    }

    type Matrix3x3 = [[number, number, number], [number, number, number], [number, number, number]];
}

export = sharp;
