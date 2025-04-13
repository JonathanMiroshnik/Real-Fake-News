import mongoose from 'mongoose';
export declare const Writer: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    status: "active" | "on-leave" | "retired";
    specialties: ("breaking-news" | "opinion" | "investigative" | "satire")[];
    relationships: mongoose.Types.DocumentArray<{
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }> & {
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }>;
    generatedContentHistory: mongoose.Types.ObjectId[];
    bio?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    status: "active" | "on-leave" | "retired";
    specialties: ("breaking-news" | "opinion" | "investigative" | "satire")[];
    relationships: mongoose.Types.DocumentArray<{
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }> & {
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }>;
    generatedContentHistory: mongoose.Types.ObjectId[];
    bio?: string | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    status: "active" | "on-leave" | "retired";
    specialties: ("breaking-news" | "opinion" | "investigative" | "satire")[];
    relationships: mongoose.Types.DocumentArray<{
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }> & {
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }>;
    generatedContentHistory: mongoose.Types.ObjectId[];
    bio?: string | null | undefined;
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
    name: string;
    status: "active" | "on-leave" | "retired";
    specialties: ("breaking-news" | "opinion" | "investigative" | "satire")[];
    relationships: mongoose.Types.DocumentArray<{
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }> & {
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }>;
    generatedContentHistory: mongoose.Types.ObjectId[];
    bio?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    status: "active" | "on-leave" | "retired";
    specialties: ("breaking-news" | "opinion" | "investigative" | "satire")[];
    relationships: mongoose.Types.DocumentArray<{
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }> & {
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }>;
    generatedContentHistory: mongoose.Types.ObjectId[];
    bio?: string | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    status: "active" | "on-leave" | "retired";
    specialties: ("breaking-news" | "opinion" | "investigative" | "satire")[];
    relationships: mongoose.Types.DocumentArray<{
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }> & {
        colleague?: mongoose.Types.ObjectId | null | undefined;
        relationshipType?: "mentor" | "rival" | "collaborator" | null | undefined;
        strength?: number | null | undefined;
    }>;
    generatedContentHistory: mongoose.Types.ObjectId[];
    bio?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=Writer.d.ts.map