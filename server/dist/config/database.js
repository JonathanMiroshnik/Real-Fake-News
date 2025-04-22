"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDatabase = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });
        console.log('Connected to MongoDB database');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
    mongoose_1.default.connection.on('connected', () => {
        console.log(`Connected to ${mongoose_1.default.connection.host}:${mongoose_1.default.connection.port}/${mongoose_1.default.connection.name}`);
    });
    mongoose_1.default.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
    });
    mongoose_1.default.connection.on('disconnected', () => {
        console.log('MongoDB connection disconnected');
    });
};
exports.default = connectDatabase;
//# sourceMappingURL=database.js.map