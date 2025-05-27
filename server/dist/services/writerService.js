"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomWriter = getRandomWriter;
const crypto_1 = require("crypto");
const lowdbOperations_1 = require("../lib/lowdb/lowdbOperations");
const databaseConfigurations_1 = require("../lib/lowdb/databaseConfigurations");
async function getRandomWriter() {
    const writersList = await (0, lowdbOperations_1.getAllPosts)(databaseConfigurations_1.writerDatabaseConfig);
    const writerReturn = writersList[(0, crypto_1.randomInt)(writersList.length)];
    if (writerReturn === undefined) {
        throw console.error("Random Writer not found");
    }
    return writerReturn;
}
//# sourceMappingURL=writerService.js.map