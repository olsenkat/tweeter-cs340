export interface AuthDAO {
    createAuthToken(alias: string): Promise<string>;
    validateAuthToken(token: string): Promise<string | null>;
    deleteAuthToken(token: string): Promise<void>;
}