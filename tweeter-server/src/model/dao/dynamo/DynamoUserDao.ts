import { UserDao } from "../interfaces/UserDao";
import { DynamoInterface } from "./DynamoInterface";
import { UserRecord } from "../../entities/UserRecord";
import { InternalServerError } from "../../errors/Error";
import { BatchGetCommand } from "@aws-sdk/lib-dynamodb";

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

  public async batchGetUsers(keys: string[]): Promise<UserRecord[]> {
    const mapItemToUserRecord = (item: any): UserRecord => ({
      alias: item.alias,
      firstName: item.firstName,
      lastName: item.lastName,
      passwordHash: item.passwordHash,
      imageKey: item.imageKey,
    });

    const batchSize = 25;
    const batches: string[][] = [];

    for (let j = 0; j < keys.length; j += batchSize) {
      const batch = keys.slice(j, j + batchSize);
      batches.push(batch);
    }

    const results: UserRecord[] = [];

    for (const batch of batches) {
      const params = {
        RequestItems: {
          [this.tableName]: {
            Keys: batch.map((alias) => ({ alias })),
          },
        },
      };

      let response = await this.client.send(new BatchGetCommand(params));
      if (response.Responses && response.Responses[this.tableName]) {
        results.push(
          ...response.Responses[this.tableName].map(mapItemToUserRecord)
        );
      }
      
      let unprocessed = response.UnprocessedKeys;
      while (unprocessed && Object.keys(unprocessed).length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 50)); // small delay before retrying
        response = await this.client.send(
          new BatchGetCommand({ RequestItems: unprocessed })
        );
        if (response.Responses && response.Responses[this.tableName]) {
          results.push(
            ...response.Responses[this.tableName].map(mapItemToUserRecord)
          );
        }
        unprocessed = response.UnprocessedKeys;
      }
    }
    return results;
  }
}
