"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeRunware = initializeRunware;
exports.generateImage = generateImage;
exports.saveDataURIToPNG = saveDataURIToPNG;
exports.generateAndSaveImage = generateAndSaveImage;
require("dotenv/config");
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const sdk_js_1 = require("@runware/sdk-js");
var runware = undefined;
async function initializeRunware() {
    if (process.env.RUNWARE_API_KEY === undefined) {
        return false;
    }
    runware = await sdk_js_1.Runware.initialize({ apiKey: process.env?.RUNWARE_API_KEY });
    await runware.ensureConnection();
    return true;
}
async function generateImage(positivePrompt) {
    if (runware === undefined) {
        if (!await initializeRunware()) {
            return "";
        }
    }
    const images = await runware.requestImages({
        positivePrompt: positivePrompt,
        width: 512,
        height: 512,
        model: "runware:100@1", // FLUX Schnell => 16k images for 10$
        numberResults: 1,
        outputType: "dataURI", //"URL" | "base64Data";
        outputFormat: "PNG", //"JPG" "WEBP";
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
    const pngBuffer = await (0, sharp_1.default)(buffer).png().toBuffer();
    // Ensure directory exists
    const imagesDir = path_1.default.join(__dirname, '../../data/images');
    fs_1.default.mkdirSync(imagesDir, { recursive: true });
    // Save file
    const filename = `img-${(0, uuid_1.v4)()}.png`;
    const filePath = path_1.default.join(imagesDir, filename);
    await fs_1.default.promises.writeFile(filePath, pngBuffer);
    return filename;
}
async function generateAndSaveImage(positivePrompt) {
    const dataURI = await generateImage(positivePrompt);
    const retImgName = await saveDataURIToPNG(dataURI);
    return retImgName;
}
//# sourceMappingURL=imageService.js.map