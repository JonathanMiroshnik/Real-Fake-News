import "dotenv/config";
export declare function initializeRunware(): Promise<boolean>;
export declare function generateImage(positivePrompt: string, format?: "PNG" | "JPG" | "WEBP"): Promise<string>;
export declare function saveDataURIToPNG(dataURI: string): Promise<string>;
export declare const saveDataUriAsWebp: (dataUri: string) => Promise<string>;
export declare function generateAndSaveImage(positivePrompt: string): Promise<string>;
