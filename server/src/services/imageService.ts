import "dotenv/config"
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// import sharp from 'sharp'; // Doesn't work with older types of linux machines, replaced with jimp
import { Jimp } from "jimp";
import { JimpMime } from "jimp";

import { Runware } from "@runware/sdk-js";

// TODO: add other such service activated flags in the other services!
const SERVICE_ACTIVATED: boolean = true;

const DEFAULT_IMAGE_NAME: string = "planet.jpg"

const ASPECT_RATIO: number = 1.75;
const DEFAULT_IMAGE_HEIGHT: number = 512;
const DEFAULT_IMAGE_WIDTH: number = DEFAULT_IMAGE_HEIGHT * ASPECT_RATIO;

var runware: any = undefined;

export async function initializeRunware(): Promise<boolean> {
    if (process.env.RUNWARE_API_KEY === undefined) {
        return false;
    }

    runware = await Runware.initialize({ apiKey: process.env?.RUNWARE_API_KEY });
    await runware.ensureConnection();    
    return true;
}

export async function generateImage(positivePrompt: string): Promise<string> {
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
        outputFormat: "PNG", //"JPG" "WEBP"; // TODO: use webp?
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

export async function saveDataURIToPNG(dataURI: string): Promise<string> {
    // Extract base64 data from Data URI
    const matchGroups = dataURI.match(/^data:image\/(?<type>\w+);base64,(?<data>.+)$/)?.groups;
    if (!matchGroups?.data) throw new Error('Invalid data URI format');    
    
    // Convert to PNG buffer
    const buffer = Buffer.from(matchGroups.data, 'base64');

    // const pngBuffer = await sharp(buffer).png().toBuffer(); // Replaced with JIMP
    const image = await Jimp.read(buffer);
    const pngBuffer = await image.getBuffer(JimpMime.png);

    // Ensure directory exists
    const imagesDir = path.join(__dirname, '../../data/images');
    fs.mkdirSync(imagesDir, { recursive: true });

    // Save file
    const filename = `img-${uuidv4()}.png`;
    const filePath = path.join(imagesDir, filename);
    await fs.promises.writeFile(filePath, pngBuffer);

    console.log("FILE",filename);

    return filename;
}

export async function generateAndSaveImage(positivePrompt: string) {
    if (!SERVICE_ACTIVATED) {
        return DEFAULT_IMAGE_NAME;
    }

    const dataURI = await generateImage(positivePrompt);
    const retImgName = await saveDataURIToPNG(dataURI);
    return retImgName;
} 