import { randomInt } from "crypto";
import { Writer } from "../types/writer";
import { getAllPosts } from "../lib/lowdb/lowdbOperations";
import { writerDatabaseConfig } from "../lib/lowdb/databaseConfigurations";

/**
 * @returns Single random Writer from the Writers in the database
 */
export async function getRandomWriter(): Promise<Writer> {
    const writersList = await getAllPosts<Writer>(writerDatabaseConfig);
    const writerReturn = writersList[randomInt(writersList.length)];
    if (writerReturn === undefined) {        
        throw console.error("Random Writer not found");
    }

    return writerReturn;
}