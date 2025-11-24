import { UserDao } from "../interfaces/UserDao";
import { DynamoInterface } from "./DynamoInterface";
import { UserRecord } from "../../entities/UserRecord";

export class DynamoUserDao extends DynamoInterface implements UserDao {
  constructor() {
    super("users", "users_index");
  }

  async getUser(alias: string): Promise<UserRecord | null> {
    const userKey = {
      alias: alias,
    };
    const user = await this.getItem(userKey);

    if (!user) {
      return null;
    }

    return {
      alias: user.alias,
      firstName: user.firstName,
      lastName: user.lastName,
      passwordHash: user.passwordHash,
      imageKey: user.imageKey,
    };
  }

  async insertUser(user: UserRecord): Promise<void> {
    const item = {
      alias: user.alias,
      firstName: user.firstName,
      lastName: user.lastName,
      passwordHash: user.passwordHash,
      imageKey: user.imageKey,
    };
    const condition = "attribute_not_exists(alias)";
    try {
      await this.putItem(item, condition, "user");
    } catch (error) {
      console.error("Dynamo putItem error: ", error);
      throw new Error("Could not create user item: " + error);
    }
  }
}
