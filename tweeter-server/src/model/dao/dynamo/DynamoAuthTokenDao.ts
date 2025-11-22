import { DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { AuthTokenRecord } from "../../entities/AuthTokenRecord";
import { AuthDao } from "../interfaces/AuthDao";
import { DynamoInterface } from "./DynamoInterface";

export class DynamoAuthDao extends DynamoInterface implements AuthDao {
  constructor() {
    super("auth", "token-index");
  }

  async createAuthToken(
    alias: string,
    token: string,
    timestamp: number
  ): Promise<void> {
    const item = {
      alias: alias,
      token: token,
      timestamp: timestamp,
    };
    const condition =
      "attribute_not_exists(alias) AND attribute_not_exists(token)";
    await this.putItem(item, condition, "auth");
  }

  async getAuthToken(token: string): Promise<AuthTokenRecord | null> {
    const query = new QueryCommand({
      KeyConditionExpression: "token = :token",
      ExpressionAttributeValues: { ":token": token },
      TableName: this.tableName,
      IndexName: this.indexName,
    });
    const data = await this.client.send(query);

    if (!data.Items || data.Items.length === 0) {
      return null;
    }

    const item = data.Items[0];
    return {
      alias: item.alias,
      token: item.token,
      timestamp: item.timestamp,
    };
  }

  async deleteAuthToken(token: string): Promise<void> {
    const authToken = await this.getAuthToken(token);
    if (!authToken) {
        return
    }
    const authKey = {
      token: token,
      alias: authToken.alias
    };
    const params = {
      TableName: this.tableName,
      Key: authKey,
    };

    await this.client.send(new DeleteCommand(params));
  }
}
