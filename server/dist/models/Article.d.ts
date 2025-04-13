import mongoose from 'mongoose';
export declare const Article: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    authorId: mongoose.Types.ObjectId;
    category: "politics" | "technology" | "entertainment" | "business" | "sports";
    status: "draft" | "published" | "archived";
    relatedArticles: mongoose.Types.ObjectId[];
    publishedAt?: NativeDate | null | undefined;
    metadata?: {
        wordCount?: number | null | undefined;
        sentimentScore?: number | null | undefined;
        generatedBy?: "openai" | "deepseek" | null | undefined;
    } | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    authorId: mongoose.Types.ObjectId;
    category: "politics" | "technology" | "entertainment" | "business" | "sports";
    status: "draft" | "published" | "archived";
    relatedArticles: mongoose.Types.ObjectId[];
    publishedAt?: NativeDate | null | undefined;
    metadata?: {
        wordCount?: number | null | undefined;
        sentimentScore?: number | null | undefined;
        generatedBy?: "openai" | "deepseek" | null | undefined;
    } | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    authorId: mongoose.Types.ObjectId;
    category: "politics" | "technology" | "entertainment" | "business" | "sports";
    status: "draft" | "published" | "archived";
    relatedArticles: mongoose.Types.ObjectId[];
    publishedAt?: NativeDate | null | undefined;
    metadata?: {
        wordCount?: number | null | undefined;
        sentimentScore?: number | null | undefined;
        generatedBy?: "openai" | "deepseek" | null | undefined;
    } | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    authorId: mongoose.Types.ObjectId;
    category: "politics" | "technology" | "entertainment" | "business" | "sports";
    status: "draft" | "published" | "archived";
    relatedArticles: mongoose.Types.ObjectId[];
    publishedAt?: NativeDate | null | undefined;
    metadata?: {
        wordCount?: number | null | undefined;
        sentimentScore?: number | null | undefined;
        generatedBy?: "openai" | "deepseek" | null | undefined;
    } | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    authorId: mongoose.Types.ObjectId;
    category: "politics" | "technology" | "entertainment" | "business" | "sports";
    status: "draft" | "published" | "archived";
    relatedArticles: mongoose.Types.ObjectId[];
    publishedAt?: NativeDate | null | undefined;
    metadata?: {
        wordCount?: number | null | undefined;
        sentimentScore?: number | null | undefined;
        generatedBy?: "openai" | "deepseek" | null | undefined;
    } | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    title: string;
    content: string;
    authorId: mongoose.Types.ObjectId;
    category: "politics" | "technology" | "entertainment" | "business" | "sports";
    status: "draft" | "published" | "archived";
    relatedArticles: mongoose.Types.ObjectId[];
    publishedAt?: NativeDate | null | undefined;
    metadata?: {
        wordCount?: number | null | undefined;
        sentimentScore?: number | null | undefined;
        generatedBy?: "openai" | "deepseek" | null | undefined;
    } | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=Article.d.ts.map