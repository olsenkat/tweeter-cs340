import { AuthTokenRecord } from "../../entities/AuthTokenRecord";

export interface AuthDao {
  createAuthToken(alias: string, token: string, timestamp: number): Promise<void>;
  updateTokenTimestamp(token: string, alias: string, timestamp: number): Promise<void>;
  getAuthToken(token: string): Promise<AuthTokenRecord | null>;
  deleteAuthToken(token: string): Promise<void>;
}
