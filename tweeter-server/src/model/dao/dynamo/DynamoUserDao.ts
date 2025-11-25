import { UserDao } from "../interfaces/UserDao";
import { DynamoInterface } from "./DynamoInterface";
import { UserRecord } from "../../entities/UserRecord";
import { InternalServerError } from "../../errors/Error";

export class DynamoUserDao extends DynamoInterface implements UserDao {
  constructor() {
    super("users", "users_index");
  }

  async getUser(alias: string): Promise<UserRecord | null> {
    try {
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
    } catch (error) {
      console.error("Dynamo getUser error: ", error);
      throw new InternalServerError("Could not get user item: " + error);
    }
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
      console.error("Dynamo putUser error: ", error);
      throw new InternalServerError("Could not put user item: " + error);
    }
  }
}
