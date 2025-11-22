import { UserRecord } from "../../entities/UserRecord";

export interface UserDao {
  getUser(alias: string): Promise<UserRecord | null>;
  insertUser(user: UserRecord): Promise<void>;
}
