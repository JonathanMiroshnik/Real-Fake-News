export declare function getUniqueKey(): string;
export interface Post {
    key: string | undefined;
}
export type Schema<T extends Post> = {
    posts: T[];
};
export declare function createPost<T extends Post>(post: T, dbFile: string): Promise<boolean>;
export declare function getAllPosts<T extends Post>(dbFile: string): Promise<T[]>;
export declare function getPostByKey<T extends Post>(key: string, dbFile: string): Promise<T | undefined>;
export declare function updatePost<T extends Post>(newPost: T, dbFile: string): Promise<boolean>;
export declare function deletePost<T extends Post>(key: string, dbFile: string): Promise<boolean>;
