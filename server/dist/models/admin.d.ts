import mongoose from 'mongoose';
export declare const Admin: mongoose.Model<{
    username: string;
    password: string;
    role: "admin" | "super-admin";
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    username: string;
    password: string;
    role: "admin" | "super-admin";
}> & {
    username: string;
    password: string;
    role: "admin" | "super-admin";
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    username: string;
    password: string;
    role: "admin" | "super-admin";
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    username: string;
    password: string;
    role: "admin" | "super-admin";
}>> & mongoose.FlatRecord<{
    username: string;
    password: string;
    role: "admin" | "super-admin";
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=admin.d.ts.map