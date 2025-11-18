import { UserDto } from "tweeter-shared";

export interface UserDao {
    getUser(alias: string): Promise<UserDto | null>;
    insertUser(user: UserDto, passwordHash: string, imageUrl: string): Promise<boolean>;
    validatePassword(alias: string, password: string): Promise<boolean>;
}