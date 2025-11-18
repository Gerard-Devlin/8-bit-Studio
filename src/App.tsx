import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ArrowDownToLine,
    Github,
    Image as ImageIcon,
    Paintbrush,
    Settings,
    Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GifReader, GifWriter } from "omggif";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EmptyPlaceholder } from "@/components/empty-placeholder";
import { hexToRgb } from "@/lib/utils";
import { AuroraBackground } from "@/components/ui/shadcn-io/aurora-background";

const PIXEL_PRESETS = [
    {
        id: "gameboy",
        label: "Game Boy DMG",
        description:
            "Muted greens with crunchy highlights inspired by the original handheld.",
        colors: [
            "#0f380f",
            "#306230",
            "#8bac0f",
            "#9bbc0f",
        ],
    },
    {
        id: "nes",
        label: "NES Warm",
        description:
            "Earthy reds and blues tuned to mimic the NES PPU palette.",
        colors: [
            "#7c0c00",
            "#ef0a1a",
            "#f2b233",
            "#1d57c2",
            "#5691f0",
        ],
    },
    {
        id: "c64",
        label: "Commodore 64",
        description:
            "Classic 16-color palette with teal shadows and lavender midtones.",
        colors: [
            "#000000",
            "#ffffff",
            "#68372b",
            "#70a4b2",
            "#6f3d86",
            "#588d43",
            "#352879",
            "#b8c76f",
            "#6f4f25",
            "#8a8a8a",
            "#adadad",
            "#c9d487",
            "#9a6759",
            "#c57d75",
            "#aea1ff",
            "#fffcc2",
        ],
    },
    {
        id: "solar",
        label: "Neon Sunset",
        description:
            "High-contrast magentas and cyans for vaporwave backdrops.",
        colors: [
            "#14002b",
            "#ff00c3",
            "#ff8f1f",
            "#00f0ff",
        ],
    },
    {
        id: "noir",
        label: "Film Noir",
        description:
            "Moody monochrome mix for dramatic, high-contrast renders.",
        colors: [
            "#0a0a0a",
            "#212121",
            "#4f4f4f",
            "#8c8c8c",
            "#d6d6d6",
            "#f8f8f8",
        ],
    },
    {
        id: "sunrise",
        label: "Desert Sunrise",
        description:
            "Warm oranges, dusty reds, and teal shadows for stylized landscapes.",
        colors: [
            "#2d1b1f",
            "#5e2f32",
            "#d94f04",
            "#f4a259",
            "#f7c480",
            "#fdefd3",
            "#3b8183",
        ],
    },
    {
        id: "arcade",
        label: "Neon Arcade",
        description:
            "Electric pinks, blues, and violets inspired by synthwave cabinets.",
        colors: [
            "#050014",
            "#1e075f",
            "#5c1a8d",
            "#c918d1",
            "#ff5dac",
            "#5de0fc",
            "#0fffc1",
        ],
    },
    {
        id: "forestlight",
        label: "Forest Light",
        description:
            "Earthy evergreens with golden shafts of light for natural scenes.",
        colors: [
            "#121a13",
            "#1f3622",
            "#3a5c33",
            "#6d8c40",
            "#a1c349",
            "#f0f4b9",
            "#d9ac63",
        ],
    },
];

const INTRO_STEPS: {
    id: number;
    title: string;
    description: string;
    icon: LucideIcon;
    accent: string;
}[] = [
    {
        id: 1,
        title: "Upload artwork",
        description:
            "Drag an image anywhere or tap Upload to bring in sketches, screenshots, or sprites.",
        icon: Upload,
        accent: "from-pink-500/20 via-fuchsia-500/10 to-transparent",
    },
    {
        id: 2,
        title: "Choose a palette",
        description:
            "Mix and match console-inspired palettes like Game Boy, NES, and more.",
        icon: Paintbrush,
        accent: "from-amber-400/25 via-orange-500/10 to-transparent",
    },
    {
        id: 3,
        title: "Dial in pixels",
        description:
            "Adjust pixel size and sampling resolution until the texture feels right.",
        icon: Settings,
        accent: "from-sky-400/20 via-blue-600/10 to-transparent",
    },
    {
        id: 4,
        title: "Export & share",
        description:
            "Download crisp PNGs or SVG vectors ready for decks, docs, or socials.",
        icon: ArrowDownToLine,
        accent: "from-emerald-400/20 via-lime-400/10 to-transparent",
    },
];

type PaletteId =
    (typeof PIXEL_PRESETS)[number]["id"];

type RasterFormat = "image/png" | "image/gif";

type PaletteEntry = {
    hex: string;
    rgb: ReturnType<typeof hexToRgb>;
};

type GifFrameData = {
    pixels: Uint8ClampedArray;
    delay: number;
};

type GifSource = {
    width: number;
    height: number;
    loopCount: number | null;
    frames: GifFrameData[];
};

const MAX_GIF_PIXELS = 4_000_000;

const getPalette = (id: PaletteId) =>
    PIXEL_PRESETS.find((p) => p.id === id) ??
    PIXEL_PRESETS[0];

export default function App() {
    const [pixelSize, setPixelSize] =
        useState(12);
    const [resolution, setResolution] =
        useState(128);
    const [paletteId, setPaletteId] =
        useState<PaletteId>("gameboy");
    const [sourceName, setSourceName] =
        useState("");
    const [sourcePreview, setSourcePreview] =
        useState<string | null>(null);
    const [resultPreview, setResultPreview] =
        useState<string | null>(null);
    const [status, setStatus] = useState("");
    const [vectorData, setVectorData] = useState<{
        colors: string[][];
        width: number;
        height: number;
        pixelSize: number;
    } | null>(null);
    const [outputFormat, setOutputFormat] =
        useState<RasterFormat>("image/png");
    const [showIntro, setShowIntro] =
        useState(true);
    const [isProcessing, setIsProcessing] =
        useState(false);
    const [sourceGif, setSourceGif] =
        useState<GifSource | null>(null);
    const [isGifParsing, setIsGifParsing] =
        useState(false);
    const palette = useMemo(
        () => getPalette(paletteId),
        [paletteId]
    );
    const paletteData: PaletteEntry[] = useMemo(
        () =>
            palette.colors.map((hex) => ({
                hex,
                rgb: hexToRgb(hex),
            })),
        [palette]
    );
    const fileInputRef =
        useRef<HTMLInputElement | null>(null);
    const jobRef = useRef(0);

    const handleFile = useCallback(
        (file: File) => {
            if (!file.type.startsWith("image")) {
                setStatus(
                    "Please upload an image file."
                );
                return;
            }
            setStatus("");
            setSourceName(file.name);
            setSourcePreview(null);
            setResultPreview(null);
            setVectorData(null);
            setSourceGif(null);

            const lowerName =
                file.name.toLowerCase();
            const isGif =
                file.type === "image/gif" ||
                lowerName.endsWith(".gif");
            setOutputFormat(
                isGif ? "image/gif" : "image/png"
            );

            const previewReader =
                new FileReader();
            previewReader.onload = () => {
                setSourcePreview(
                    previewReader.result as string
                );
            };
            previewReader.readAsDataURL(file);

            if (isGif) {
                setIsGifParsing(true);
                file.arrayBuffer()
                    .then((buffer) => {
                        const parsedGif =
                            extractGifSource(
                                new Uint8Array(
                                    buffer
                                )
                            );
                        setSourceGif(parsedGif);
                        setStatus("");
                    })
                    .catch((error) => {
                        console.error(
                            "[gif-parse]",
                            error
                        );
                        setStatus(
                            "Failed to parse GIF."
                        );
                        setOutputFormat(
                            "image/png"
                        );
                        setSourceGif(null);
                    })
                    .finally(() =>
                        setIsGifParsing(false)
                    );
            } else {
                setIsGifParsing(false);
            }
        },
        []
    );
    const onDrop = useCallback(
        (
            event: React.DragEvent<HTMLDivElement>
        ) => {
            event.preventDefault();
            const file =
                event.dataTransfer.files?.[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const convertImage = useCallback(
        (jobId: number) => {
            const describeError = (
                error: unknown
            ) => {
                if (!error) return "";
                if (
                    typeof error === "object" &&
                    error &&
                    "message" in error &&
                    typeof (
                        error as {
                            message: unknown;
                        }
                    ).message === "string"
                ) {
                    return (error as Error)
                        .message;
                }
                if (typeof error === "string")
                    return error;
                try {
                    return JSON.stringify(error);
                } catch {
                    return "";
                }
            };

            const fail = (
                message: string,
                error?: unknown
            ) => {
                if (jobRef.current !== jobId)
                    return;
                const detail =
                    describeError(error);
                setStatus(
                    detail
                        ? `${message}: ${detail}`
                        : message
                );
                setIsProcessing(false);
            };

            if (
                outputFormat === "image/gif" &&
                !sourceGif
            ) {
                if (isGifParsing) {
                    setStatus("Parsing GIF...");
                    return;
                }
                fail(
                    "GIF data is not available."
                );
                return;
            }

            const finalize = (
                previewUrl: string,
                vector: {
                    colors: string[][];
                    width: number;
                    height: number;
                } | null,
                nextStatus = ""
            ) => {
                if (jobRef.current !== jobId) {
                    if (
                        previewUrl.startsWith(
                            "blob:"
                        )
                    ) {
                        URL.revokeObjectURL(
                            previewUrl
                        );
                    }
                    return;
                }
                setResultPreview(previewUrl);
                if (vector) {
                    setVectorData({
                        colors: vector.colors,
                        width: vector.width,
                        height: vector.height,
                        pixelSize,
                    });
                }
                setStatus(nextStatus);
                setIsProcessing(false);
            };

            if (
                outputFormat === "image/gif" &&
                sourceGif
            ) {
                try {
                    const frameCount =
                        sourceGif.frames.length;
                    if (!frameCount) {
                        throw new Error(
                            "GIF contains no valid frames."
                        );
                    }
                    const aspect =
                        sourceGif.height /
                            sourceGif.width || 1;
                    const sampleWidth = Math.max(
                        8,
                        resolution
                    );
                    const sampleHeight = Math.max(
                        8,
                        Math.round(
                            sampleWidth * aspect
                        )
                    );
                    const safePixelSize =
                        getSafeGifPixelSize(
                            sampleWidth,
                            sampleHeight,
                            frameCount,
                            pixelSize
                        );
                    const paletteHex =
                        paletteData.map(
                            (entry) => entry.hex
                        );
                    const {
                        paletteColors,
                        colorIndexMap,
                        fallbackIndex,
                    } =
                        buildPaletteLookup(
                            paletteHex
                        );
                    const finalWidth =
                        sampleWidth *
                        safePixelSize;
                    const finalHeight =
                        sampleHeight *
                        safePixelSize;
                    const buffer = new Uint8Array(
                        finalWidth *
                            finalHeight *
                            frameCount *
                            5
                    );
                    const writer = new GifWriter(
                        buffer,
                        finalWidth,
                        finalHeight,
                        {
                            palette:
                                paletteColors,
                            loop: normalizeLoopCount(
                                sourceGif.loopCount
                            ),
                        }
                    );
                    let firstVector: {
                        colors: string[][];
                        width: number;
                        height: number;
                    } | null = null;
                    sourceGif.frames.forEach(
                        (frame) => {
                            const quantizedGrid =
                                quantizeFramePixels(
                                    {
                                        framePixels:
                                            frame.pixels,
                                        sourceWidth:
                                            sourceGif.width,
                                        sourceHeight:
                                            sourceGif.height,
                                        sampleWidth,
                                        sampleHeight,
                                        paletteData,
                                    }
                                );
                            if (!firstVector) {
                                firstVector = {
                                    colors: quantizedGrid,
                                    width: sampleWidth,
                                    height: sampleHeight,
                                };
                            }
                            const indexedPixels =
                                colorGridToIndexedPixels(
                                    {
                                        colors: quantizedGrid,
                                        pixelSize:
                                            safePixelSize,
                                        colorIndexMap,
                                        fallbackIndex,
                                    }
                                );
                            writer.addFrame(
                                0,
                                0,
                                finalWidth,
                                finalHeight,
                                indexedPixels,
                                {
                                    delay: clampFrameDelay(
                                        frame.delay
                                    ),
                                }
                            );
                        }
                    );
                    const byteLength =
                        writer.end();
                    const gifUrl =
                        URL.createObjectURL(
                            new Blob(
                                [
                                    buffer.subarray(
                                        0,
                                        byteLength
                                    ),
                                ],
                                {
                                    type: "image/gif",
                                }
                            )
                        );
                    finalize(
                        gifUrl,
                        firstVector,
                        safePixelSize < pixelSize
                            ? "GIF output is large; pixel size was reduced automatically."
                            : ""
                    );
                } catch (error) {
                    console.error(
                        "[gif-convert]",
                        error
                    );
                    fail(
                        "GIF processing failed",
                        error
                    );
                }
                return;
            }

            if (!sourcePreview) {
                fail(
                    "Please upload an image first."
                );
                return;
            }

            const image = new Image();
            image.crossOrigin = "anonymous";
            image.onload = () => {
                if (jobRef.current !== jobId)
                    return;
                try {
                    const aspect =
                        image.height /
                            image.width || 1;
                    const sampleWidth = Math.max(
                        8,
                        resolution
                    );
                    const sampleHeight = Math.max(
                        8,
                        Math.round(
                            sampleWidth * aspect
                        )
                    );
                    const sampleCanvas =
                        document.createElement(
                            "canvas"
                        );
                    sampleCanvas.width =
                        sampleWidth;
                    sampleCanvas.height =
                        sampleHeight;
                    const sampleCtx =
                        sampleCanvas.getContext(
                            "2d",
                            {
                                willReadFrequently:
                                    true,
                            }
                        );
                    if (!sampleCtx) {
                        throw new Error(
                            "Unable to create a sample canvas."
                        );
                    }
                    sampleCtx.drawImage(
                        image,
                        0,
                        0,
                        sampleWidth,
                        sampleHeight
                    );
                    const quantized =
                        quantizeSampleCanvas({
                            sampleCanvas,
                            sampleCtx,
                            paletteData,
                            pixelSize,
                        });
                    if (!quantized.outputCanvas) {
                        throw new Error(
                            "Missing output canvas."
                        );
                    }
                    const previewUrl =
                        quantized.outputCanvas.toDataURL(
                            "image/png"
                        );
                    finalize(
                        previewUrl,
                        {
                            colors: quantized.colorGrid,
                            width: quantized.sampleWidth,
                            height: quantized.sampleHeight,
                        },
                        ""
                    );
                } catch (error) {
                    console.error(
                        "[image-convert]",
                        error
                    );
                    fail(
                        "Failed to generate pixel art.",
                        error
                    );
                }
            };
            image.onerror = (event) => {
                fail(
                    "Image failed to load.",
                    event
                );
            };
            image.src = sourcePreview;
        },
        [
            outputFormat,
            paletteData,
            pixelSize,
            resolution,
            sourceGif,
            sourcePreview,
            isGifParsing,
        ]
    );

    const rebuild = useCallback(() => {
        if (!sourcePreview && !sourceGif) {
            setStatus(
                "Please upload an image first."
            );
            return;
        }
        const jobId = jobRef.current + 1;
        jobRef.current = jobId;
        setIsProcessing(true);
        setStatus("Building pixel preview...");
        setVectorData(null);
        setResultPreview(null);
        convertImage(jobId);
    }, [convertImage, sourceGif, sourcePreview]);

    useEffect(() => {
        if (
            outputFormat === "image/gif" &&
            (isGifParsing || !sourceGif)
        ) {
            if (isGifParsing) {
                setStatus("Parsing GIF...");
            }
            return;
        }
        if (!sourcePreview && !sourceGif) {
            setResultPreview(null);
            setVectorData(null);
            return;
        }
        rebuild();
    }, [
        rebuild,
        sourcePreview,
        sourceGif,
        outputFormat,
        isGifParsing,
    ]);

    useEffect(() => {
        return () => {
            if (
                resultPreview &&
                resultPreview.startsWith("blob:")
            ) {
                URL.revokeObjectURL(
                    resultPreview
                );
            }
        };
    }, [resultPreview]);

    const handleDownloadRaster = () => {
        if (!resultPreview) return;
        const extension =
            outputFormat === "image/gif"
                ? "gif"
                : "png";
        const a = document.createElement("a");
        a.href = resultPreview;
        a.download = `pixel-art-${paletteId}.${extension}`;
        a.click();
    };

    const handleDownloadSvg = () => {
        if (!vectorData) return;
        const svg =
            buildSvgFromColors(vectorData);
        if (!svg) return;
        const blob = new Blob([svg], {
            type: "image/svg+xml",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pixel-art-${paletteId}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AuroraBackground className="min-h-screen w-full items-start justify-start bg-slate-950/90 text-white py-6 sm:py-10">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4">
                <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5/40 px-4 py-4 backdrop-blur md:flex-row md:flex-wrap md:items-center md:px-5">
                    <div
                        onDragOver={(event) =>
                            event.preventDefault()
                        }
                        onDrop={onDrop}
                        className="flex flex-1 min-w-[240px] items-center gap-3 rounded-2xl border border-dashed border-white/20 bg-black/30 px-4 py-3">
                        <ImageIcon className="h-5 w-5 text-white/60 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold max-w-[220px]">
                                {sourceName ||
                                    "Drop an image"}
                            </p>
                            <p className="text-xs text-white/50">
                                PNG / JPG / GIF
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                                const file =
                                    event.target
                                        .files?.[0];
                                if (file)
                                    handleFile(
                                        file
                                    );
                            }}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-shrink-0"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }>
                            <Upload className="h-4 w-4" />
                            Upload
                        </Button>
                    </div>
                    <div className="flex min-w-[200px] items-center gap-3 rounded-2xl border border-white/10 px-4 py-3">
                        <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                            Palette
                        </span>
                        <Select
                            value={paletteId}
                            onValueChange={(
                                value
                            ) =>
                                setPaletteId(
                                    value as PaletteId
                                )
                            }>
                            <SelectTrigger className="w-[180px] rounded-xl bg-white/5">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PIXEL_PRESETS.map(
                                    (preset) => (
                                        <SelectItem
                                            value={
                                                preset.id
                                            }
                                            key={
                                                preset.id
                                            }>
                                            {
                                                preset.label
                                            }
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <InlineSlider
                        label="Pixel"
                        value={pixelSize}
                        unit="px"
                        min={4}
                        max={28}
                        step={1}
                        onChange={setPixelSize}
                    />
                    <InlineSlider
                        label="Columns"
                        value={resolution}
                        unit=""
                        min={40}
                        max={384}
                        step={4}
                        onChange={setResolution}
                    />
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={
                                handleDownloadRaster
                            }
                            disabled={
                                !resultPreview
                            }
                            className="rounded-2xl border border-white/10 px-4 text-xs uppercase tracking-wide">
                            <ArrowDownToLine className="h-4 w-4" />
                            {outputFormat ===
                            "image/gif"
                                ? "GIF"
                                : "PNG"}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={
                                handleDownloadSvg
                            }
                            disabled={!vectorData}
                            className="rounded-2xl border border-white/10 px-4 text-xs uppercase tracking-wide">
                            <ArrowDownToLine className="h-4 w-4" />
                            SVG
                        </Button>
                    </div>
                </div>
                {status && (
                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                        {status}
                    </div>
                )}
                <ResultPreview
                    preview={resultPreview}
                    vectorData={vectorData}
                    processing={isProcessing}
                />
            </div>
            {showIntro && (
                <IntroModal
                    onClose={() =>
                        setShowIntro(false)
                    }
                />
            )}
        </AuroraBackground>
    );
}

function InlineSlider({
    label,
    value,
    unit,
    min,
    max,
    step,
    onChange,
}: {
    label: string;
    value: number;
    unit: string;
    min: number;
    max: number;
    step: number;
    onChange: (val: number) => void;
}) {
    return (
        <div className="flex min-w-[200px] flex-col gap-1 text-sm">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/50">
                <span>{label}</span>
                <span className="text-white/80">
                    {value}
                    {unit}
                </span>
            </div>
            <Slider
                value={[value]}
                min={min}
                max={max}
                step={step}
                onValueChange={(vals) =>
                    onChange(vals[0])
                }
            />
        </div>
    );
}

function ResultPreview({
    preview,
    vectorData,
    processing,
}: {
    preview: string | null;
    vectorData: {
        width: number;
        height: number;
        pixelSize: number;
    } | null;
    processing: boolean;
}) {
    const sizeLabel = useMemo(() => {
        if (!vectorData) return "--";
        const w =
            vectorData.width *
            vectorData.pixelSize;
        const h =
            vectorData.height *
            vectorData.pixelSize;
        return `${w}x${h}px`;
    }, [vectorData]);

    return (
        <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
                <p className="text-white/70">
                    Pixel Output
                </p>
                <span className="rounded-full border border-white/15 px-3 py-0.5 text-xs text-white/60">
                    {sizeLabel}
                </span>
            </div>
            <div className="flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/5">
                {preview && !processing ? (
                    <img
                        src={preview}
                        className="max-h-full max-w-full object-contain"
                        alt="Pixel result"
                    />
                ) : processing ? (
                    <EmptyPlaceholder
                        message="Rebuilding pixels..."
                        spinning
                    />
                ) : (
                    <EmptyPlaceholder message="Result will appear here." />
                )}
            </div>
        </div>
    );
}

function buildSvgFromColors({
    colors,
    width,
    height,
    pixelSize,
}: {
    colors: string[][];
    width: number;
    height: number;
    pixelSize: number;
}) {
    const svgWidth = width * pixelSize;
    const svgHeight = height * pixelSize;
    const rects: string[] = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = colors[y]?.[x];
            if (!color) continue;
            rects.push(
                `<rect x="${x * pixelSize}" y="${
                    y * pixelSize
                }" width="${pixelSize}" height="${pixelSize}" fill="${color}" />`
            );
        }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" shape-rendering="crispEdges">
  ${rects.join("\n  ")}
</svg>`;
}

function quantizeSampleCanvas({
    sampleCanvas,
    sampleCtx,
    paletteData,
    pixelSize,
    includeOutputCanvas = true,
}: {
    sampleCanvas: HTMLCanvasElement;
    sampleCtx: CanvasRenderingContext2D;
    paletteData: PaletteEntry[];
    pixelSize: number;
    includeOutputCanvas?: boolean;
}) {
    const sampleWidth = sampleCanvas.width;
    const sampleHeight = sampleCanvas.height;
    const { data } = sampleCtx.getImageData(
        0,
        0,
        sampleWidth,
        sampleHeight
    );
    const quantized = new Uint8ClampedArray(
        data.length
    );
    const colorGrid: string[][] = Array.from(
        { length: sampleHeight },
        () => new Array<string>(sampleWidth)
    );

    for (let y = 0; y < sampleHeight; y++) {
        for (let x = 0; x < sampleWidth; x++) {
            const index =
                (y * sampleWidth + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            let closest = paletteData[0];
            let best = Number.MAX_VALUE;
            for (const entry of paletteData) {
                const { rgb } = entry;
                const distance =
                    (rgb.r - r) ** 2 +
                    (rgb.g - g) ** 2 +
                    (rgb.b - b) ** 2;
                if (distance < best) {
                    best = distance;
                    closest = entry;
                }
            }
            quantized[index] = closest.rgb.r;
            quantized[index + 1] = closest.rgb.g;
            quantized[index + 2] = closest.rgb.b;
            quantized[index + 3] = 255;
            colorGrid[y][x] = closest.hex;
        }
    }

    sampleCtx.putImageData(
        new ImageData(
            quantized,
            sampleWidth,
            sampleHeight
        ),
        0,
        0
    );

    let outputCanvas: HTMLCanvasElement | null =
        null;
    if (includeOutputCanvas) {
        outputCanvas =
            document.createElement("canvas");
        outputCanvas.width =
            sampleWidth * pixelSize;
        outputCanvas.height =
            sampleHeight * pixelSize;
        const outputCtx =
            outputCanvas.getContext("2d");
        if (!outputCtx) {
            throw new Error(
                "Unable to create export canvas."
            );
        }
        outputCtx.imageSmoothingEnabled = false;
        outputCtx.drawImage(
            sampleCanvas,
            0,
            0,
            sampleWidth,
            sampleHeight,
            0,
            0,
            outputCanvas.width,
            outputCanvas.height
        );
    }

    return {
        colorGrid,
        sampleWidth,
        sampleHeight,
        outputCanvas,
    };
}

function quantizeFramePixels({
    framePixels,
    sourceWidth,
    sourceHeight,
    sampleWidth,
    sampleHeight,
    paletteData,
}: {
    framePixels: Uint8ClampedArray;
    sourceWidth: number;
    sourceHeight: number;
    sampleWidth: number;
    sampleHeight: number;
    paletteData: PaletteEntry[];
}) {
    const colorGrid: string[][] = Array.from(
        { length: sampleHeight },
        () => new Array<string>(sampleWidth)
    );
    const clamp = (value: number, max: number) =>
        Math.min(max - 1, Math.max(0, value));
    for (let y = 0; y < sampleHeight; y++) {
        const sourceY = clamp(
            Math.floor(
                ((y + 0.5) / sampleHeight) *
                    sourceHeight
            ),
            sourceHeight
        );
        for (let x = 0; x < sampleWidth; x++) {
            const sourceX = clamp(
                Math.floor(
                    ((x + 0.5) / sampleWidth) *
                        sourceWidth
                ),
                sourceWidth
            );
            const index =
                (sourceY * sourceWidth +
                    sourceX) *
                4;
            const r = framePixels[index];
            const g = framePixels[index + 1];
            const b = framePixels[index + 2];
            let closest = paletteData[0];
            let best = Number.MAX_VALUE;
            for (const entry of paletteData) {
                const { rgb } = entry;
                const distance =
                    (rgb.r - r) ** 2 +
                    (rgb.g - g) ** 2 +
                    (rgb.b - b) ** 2;
                if (distance < best) {
                    best = distance;
                    closest = entry;
                }
            }
            colorGrid[y][x] = closest.hex;
        }
    }
    return colorGrid;
}

function clampFrameDelay(delay: number) {
    if (!Number.isFinite(delay) || delay <= 0) {
        return 6;
    }
    return Math.max(
        1,
        Math.min(65535, Math.round(delay))
    );
}

function getSafeGifPixelSize(
    sampleWidth: number,
    sampleHeight: number,
    frameCount: number,
    desiredPixelSize: number
) {
    const frameArea = sampleWidth * sampleHeight;
    if (
        frameArea <= 0 ||
        !Number.isFinite(frameArea) ||
        frameCount <= 0
    ) {
        return Math.max(1, desiredPixelSize);
    }
    const maxPixelSize = Math.floor(
        Math.sqrt(
            MAX_GIF_PIXELS /
                Math.max(
                    frameArea * frameCount,
                    1
                )
        )
    );
    if (
        !Number.isFinite(maxPixelSize) ||
        maxPixelSize <= 0
    ) {
        return 1;
    }
    return Math.max(
        1,
        Math.min(desiredPixelSize, maxPixelSize)
    );
}

function normalizeLoopCount(
    loopCount: number | null
) {
    if (
        typeof loopCount !== "number" ||
        !Number.isFinite(loopCount) ||
        loopCount < 0
    ) {
        return 0;
    }
    return Math.min(65535, Math.round(loopCount));
}

function buildPaletteLookup(palette: string[]) {
    const normalizedPalette = Array.from(
        new Set(
            (palette.length
                ? palette
                : ["#000000", "#ffffff"]
            ).map((hex) => hex.toLowerCase())
        )
    );
    if (!normalizedPalette.length) {
        normalizedPalette.push(
            "#000000",
            "#ffffff"
        );
    } else if (normalizedPalette.length === 1) {
        normalizedPalette.push(
            normalizedPalette[0]
        );
    }
    const cappedLength = Math.min(
        256,
        normalizedPalette.length
    );
    const targetSize = Math.max(
        2,
        1 <<
            Math.ceil(
                Math.log2(
                    Math.max(2, cappedLength)
                )
            )
    );
    const fallbackHex =
        normalizedPalette[
            normalizedPalette.length - 1
        ];
    const paddedPalette = normalizedPalette.slice(
        0,
        targetSize
    );
    while (paddedPalette.length < targetSize) {
        paddedPalette.push(fallbackHex);
    }
    const paletteColors = paddedPalette.map(
        (hex) => {
            const { r, g, b } = hexToRgb(hex);
            return (r << 16) | (g << 8) | b;
        }
    );
    const colorIndexMap = new Map<
        string,
        number
    >();
    paddedPalette.forEach((hex, index) => {
        if (!colorIndexMap.has(hex)) {
            colorIndexMap.set(hex, index);
        }
    });
    const fallbackIndex =
        colorIndexMap.get(fallbackHex) ?? 0;
    return {
        paletteColors,
        colorIndexMap,
        fallbackIndex,
    };
}

function colorGridToIndexedPixels({
    colors,
    pixelSize,
    colorIndexMap,
    fallbackIndex,
}: {
    colors: string[][];
    pixelSize: number;
    colorIndexMap: Map<string, number>;
    fallbackIndex: number;
}) {
    const sampleHeight = colors.length;
    const sampleWidth = colors[0]?.length ?? 0;
    if (sampleHeight === 0 || sampleWidth === 0) {
        throw new Error("Color grid is empty.");
    }
    const finalWidth = sampleWidth * pixelSize;
    const finalHeight = sampleHeight * pixelSize;
    const indexedPixels = new Uint8Array(
        finalWidth * finalHeight
    );
    for (let y = 0; y < sampleHeight; y++) {
        for (let dy = 0; dy < pixelSize; dy++) {
            const row = y * pixelSize + dy;
            const rowOffset = row * finalWidth;
            for (
                let x = 0;
                x < sampleWidth;
                x++
            ) {
                const colorHex =
                    colors[y]?.[
                        x
                    ]?.toLowerCase() ?? "";
                const paletteIndex =
                    colorIndexMap.get(colorHex) ??
                    fallbackIndex;
                for (
                    let dx = 0;
                    dx < pixelSize;
                    dx++
                ) {
                    const column =
                        x * pixelSize + dx;
                    indexedPixels[
                        rowOffset + column
                    ] = paletteIndex;
                }
            }
        }
    }
    return indexedPixels;
}

function extractGifSource(
    bytes: Uint8Array
): GifSource {
    const reader = new GifReader(bytes);
    const width = reader.width;
    const height = reader.height;
    const loopCount = reader.loopCount();
    const frameCount = reader.numFrames();
    if (frameCount === 0) {
        throw new Error("GIF contains no frames");
    }
    const canvasState = new Uint8ClampedArray(
        width * height * 4
    );
    const frames: GifFrameData[] = [];
    for (let i = 0; i < frameCount; i++) {
        const frameInfo = reader.frameInfo(i);
        let restoreBuffer: Uint8ClampedArray | null =
            null;
        if (frameInfo.disposal === 3) {
            restoreBuffer = canvasState.slice();
        }
        reader.decodeAndBlitFrameRGBA(
            i,
            canvasState
        );
        frames.push({
            pixels: new Uint8ClampedArray(
                canvasState
            ),
            delay: frameInfo.delay ?? 0,
        });
        if (frameInfo.disposal === 2) {
            clearFrameRegion(
                canvasState,
                width,
                frameInfo
            );
        } else if (
            frameInfo.disposal === 3 &&
            restoreBuffer
        ) {
            canvasState.set(restoreBuffer);
        }
    }
    return {
        width,
        height,
        loopCount,
        frames,
    };
}

function clearFrameRegion(
    buffer: Uint8ClampedArray,
    canvasWidth: number,
    frame: {
        x: number;
        y: number;
        width: number;
        height: number;
    }
) {
    for (let row = 0; row < frame.height; row++) {
        const start =
            ((frame.y + row) * canvasWidth +
                frame.x) *
            4;
        buffer.fill(
            0,
            start,
            start + frame.width * 4
        );
    }
}

function IntroModal({
    onClose,
}: {
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-10">
            <div className="w-full max-w-3xl rounded-3xl border border-white/15 bg-slate-950/95 text-white shadow-2xl">
                <div className="space-y-6 p-6 sm:p-8 max-h-[80vh] overflow-y-auto sm:max-h-none sm:overflow-visible">
                    <div className="space-y-3 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <img
                                src="./logo.png"
                                alt="8-bit Studio logo"
                                className="h-25 w-25 rounded-2xl  shadow-lg"
                            />
                        </div>
                        <p className="text-sm text-slate-300">
                            Follow this quick
                            guide to turn sketches
                            or photos into crisp
                            pixel art in minutes.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {INTRO_STEPS.map(
                            ({
                                id,
                                title,
                                description,
                                icon: Icon,
                                accent,
                            }) => (
                                <div
                                    key={id}
                                    className="group relative overflow-hidden rounded-2xl border border-white/15 bg-slate-950/70 p-4 text-left text-white shadow-sm transition hover:-translate-y-0.5 hover:border-white/40 hover:shadow-lg">
                                    <div
                                        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-70 mix-blend-screen`}
                                        aria-hidden="true"
                                    />
                                    <div className="relative space-y-2">
                                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-slate-900/80 text-white shadow-inner">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-semibold tracking-tight text-white">
                                            {
                                                title
                                            }
                                        </h3>
                                        <p className="text-sm text-white/70">
                                            {
                                                description
                                            }
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                    <Button
                        className="w-full rounded-2xl bg-slate-900 py-6 text-base font-semibold transition hover:bg-slate-900/90"
                        onClick={onClose}>
                        Start Creating
                    </Button>
                    <a
                        href="https://github.com/Gerard-Devlin/8-bit-Studio"
                        target="_blank"
                        rel="noreferrer"
                        className="mx-auto flex items-center justify-center gap-2 text-xs text-slate-400 transition-colors hover:text-white"
                        aria-label="View the PixelMuse repository on GitHub">
                        <Github className="h-3.5 w-3.5" />
                        Gerard-Devlin/8-bit-Studio
                    </a>
                </div>
            </div>
        </div>
    );
}
