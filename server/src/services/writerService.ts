import { randomInt } from "crypto";
import { DB_WRITERS_FILE } from "../config/constants";
import { Writer } from "../types/writer";
import { getAllPosts } from "../lib/lowdb/lowdbOperations";
import { writerDatabaseConfig } from "../lib/lowdb/databaseConfigurations";

export async function getRandomWriter(): Promise<Writer> {
    const writersList = await getAllPosts<Writer>(writerDatabaseConfig);
    const writerReturn = writersList[randomInt(writersList.length)];
    if (writerReturn === undefined) {        
        throw console.error("Random Writer not found");
    }

    return writerReturn;
}