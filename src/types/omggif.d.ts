declare module "omggif" {
    interface GifWriterOptions {
        palette?: number[];
        loop?: number | null;
        background?: number;
    }

    interface GifFrameOptions {
        palette?: number[];
        delay?: number;
        disposal?: number;
        transparent?: number | null;
    }

    export class GifWriter {
        constructor(
            buffer: Uint8Array,
            width: number,
            height: number,
            options?: GifWriterOptions
        );
        addFrame(
            x: number,
            y: number,
            width: number,
            height: number,
            indexedPixels: Uint8Array,
            options?: GifFrameOptions
        ): number;
        end(): number;
    }

    interface GifFrameInfo {
        x: number;
        y: number;
        width: number;
        height: number;
        delay: number;
        disposal: number;
    }

    export class GifReader {
        constructor(buffer: Uint8Array);
        width: number;
        height: number;
        numFrames(): number;
        loopCount(): number | null;
        frameInfo(frameIndex: number): GifFrameInfo;
        decodeAndBlitFrameRGBA(
            frameIndex: number,
            pixels: Uint8Array | Uint8ClampedArray
        ): void;
    }
}
