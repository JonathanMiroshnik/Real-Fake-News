"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDataUriAsWebp = void 0;
exports.initializeRunware = initializeRunware;
exports.generateImage = generateImage;
exports.saveDataURIToPNG = saveDataURIToPNG;
exports.generateAndSaveImage = generateAndSaveImage;
require("dotenv/config");
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// import sharp from 'sharp'; // Doesn't work with older types of linux machines, replaced with jimp
const jimp_1 = require("jimp");
const jimp_2 = require("jimp");
// For WEBP support: https://github.com/jhuckaby/webp-wasm
// import webp from 'wasm-webp';
const sdk_js_1 = require("@runware/sdk-js");
// TODO: add other such service activated flags in the other services!
const SERVICE_ACTIVATED = true;
const DEFAULT_IMAGE_NAME = "planet.jpg";
const ASPECT_RATIO = 1.75;
const DEFAULT_IMAGE_HEIGHT = 512;
const DEFAULT_IMAGE_WIDTH = DEFAULT_IMAGE_HEIGHT * ASPECT_RATIO;
var runware = undefined;
async function initializeRunware() {
    if (process.env.RUNWARE_API_KEY === undefined) {
        return false;
    }
    runware = await sdk_js_1.Runware.initialize({ apiKey: process.env?.RUNWARE_API_KEY });
    await runware.ensureConnection();
    return true;
}
async function generateImage(positivePrompt, format = "WEBP") {
    if (!SERVICE_ACTIVATED) {
        return DEFAULT_IMAGE_NAME;
    }
    if (runware === undefined) {
        if (!await initializeRunware()) {
            return "";
        }
    }
    const images = await runware.requestImages({
        positivePrompt: positivePrompt,
        width: DEFAULT_IMAGE_WIDTH,
        height: DEFAULT_IMAGE_HEIGHT,
        model: "runware:100@1", // FLUX Schnell => 16k images for 10$
        numberResults: 1,
        outputType: "dataURI", //"URL" | "base64Data";
        outputFormat: format, //"JPG" "WEBP"; // TODO: use webp?
        checkNSFW: true,
        // strength
        steps: 20,
        CFGScale: 7,
        retry: 1,
    });
    if (images === undefined) {
        return "";
    }
    return images[0].imageDataURI;
}
async function saveDataURIToPNG(dataURI) {
    // Extract base64 data from Data URI
    const matchGroups = dataURI.match(/^data:image\/(?<type>\w+);base64,(?<data>.+)$/)?.groups;
    if (!matchGroups?.data)
        throw new Error('Invalid data URI format');
    // Convert to PNG buffer
    const buffer = Buffer.from(matchGroups.data, 'base64');
    // const pngBuffer = await sharp(buffer).png().toBuffer(); // Replaced with JIMP
    const image = await jimp_1.Jimp.read(buffer);
    const pngBuffer = await image.getBuffer(jimp_2.JimpMime.png);
    // Ensure directory exists
    const imagesDir = path_1.default.join(__dirname, '../../data/images');
    fs_1.default.mkdirSync(imagesDir, { recursive: true });
    // Save file
    const filename = `img-${(0, uuid_1.v4)()}.png`;
    const filePath = path_1.default.join(imagesDir, filename);
    await fs_1.default.promises.writeFile(filePath, pngBuffer);
    return filename;
}
const saveDataUriAsWebp = async (dataUri) => {
    // Verify data URI format
    const matches = dataUri.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches || matches[1] !== 'image/webp') {
        throw new Error('Invalid WebP data URI format');
    }
    // Generate unique filename
    const filename = `img-${(0, uuid_1.v4)()}.webp`;
    const imagePath = path_1.default.resolve(__dirname, '../../data/images', filename);
    try {
        // Convert base64 to buffer and write to file
        const buffer = Buffer.from(matches[2], 'base64');
        await fs_1.default.promises.writeFile(imagePath, buffer);
        return filename;
    }
    catch (error) {
        throw new Error(`Failed to save WebP image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.saveDataUriAsWebp = saveDataUriAsWebp;
async function generateAndSaveImage(positivePrompt) {
    if (!SERVICE_ACTIVATED) {
        return DEFAULT_IMAGE_NAME;
    }
    const format = "WEBP";
    const dataURI = await generateImage(positivePrompt, format);
    if (format === "WEBP") {
        return await (0, exports.saveDataUriAsWebp)(dataURI);
    }
    else {
        return await saveDataURIToPNG(dataURI);
    }
}
//# sourceMappingURL=imageService.js.map