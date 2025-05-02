import "dotenv/config"
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Runware } from "@runware/sdk-js";

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

export async function saveDataURIToPNG(dataURI: string): Promise<string> {
    // Extract base64 data from Data URI
    const matchGroups = dataURI.match(/^data:image\/(?<type>\w+);base64,(?<data>.+)$/)?.groups;
    if (!matchGroups?.data) throw new Error('Invalid data URI format');    
    
    // Convert to PNG buffer
    const buffer = Buffer.from(matchGroups.data, 'base64');
    const pngBuffer = await sharp(buffer).png().toBuffer();

    // Ensure directory exists
    const imagesDir = path.join(__dirname, '../../data/images');
    fs.mkdirSync(imagesDir, { recursive: true });

    // Save file
    const filename = `img-${uuidv4()}.png`;
    const filePath = path.join(imagesDir, filename);
    await fs.promises.writeFile(filePath, pngBuffer);

    return filename;
}

export async function generateAndSaveImage(positivePrompt: string) {
    const dataURI = await generateImage(positivePrompt);
    const retImgName = await saveDataURIToPNG(dataURI);
    return retImgName;
} 