import { DatabaseConfig } from './databaseConfigurations';
export declare function getUniqueKey(): string;
export interface Post {
    key: string | undefined;
}
export type Schema<T> = {
    posts: T[];
};
export declare function createPost<P>(post: P, dbConfig: DatabaseConfig<P>): Promise<boolean>;
export declare function getAllPosts<P>(dbConfig: DatabaseConfig<P>): Promise<P[]>;
export declare function getPostByKey<P>(key: string, dbConfig: DatabaseConfig<P>): Promise<P | undefined>;
export declare function updatePost<P>(newPost: P, dbConfig: DatabaseConfig<P>): Promise<boolean>;
export declare function deletePost<P>(key: string, dbConfig: DatabaseConfig<P>): Promise<boolean>;
