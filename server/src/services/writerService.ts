import { randomInt } from "crypto";
import { Writer } from "../types/writer.js";
import { getAllPosts } from "../lib/database/sqliteOperations.js";
import { writerDatabaseConfig } from "../lib/database/databaseConfigurations.js";

/**
 * @returns Single random Writer from the Writers in the database
 */
export async function getRandomWriter(): Promise<Writer> {
    const writersList = await getAllPosts<Writer>(writerDatabaseConfig);
    
    if (writersList.length === 0) {
        throw new Error("No writers found in the database. Cannot select a random writer.");
    }
    
    const writerReturn = writersList[randomInt(writersList.length)];
    if (writerReturn === undefined) {        
        throw new Error("Random Writer not found");
    }

    return writerReturn;
}