import {
  DeleteCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { AuthTokenRecord } from "../../entities/AuthTokenRecord";
import { AuthDao } from "../interfaces/AuthDao";
import { DynamoInterface } from "./DynamoInterface";
import { InternalServerError } from "../../errors/Error";

export class DynamoAuthDao extends DynamoInterface implements AuthDao {
  constructor() {
    super("auth", "token_index");
  }

  async createAuthToken(
    alias: string,
    token: string,
    timestamp: number
  ): Promise<void> {
    try {
      const item = {
        alias: alias,
        token: token,
        timestamp: timestamp,
      };
      const condition =
        "attribute_not_exists(#alias) AND attribute_not_exists(#token)";
      const expressionAttributeNames = {
        "#alias": "alias",
        "#token": "token",
      };
      await this.putItem(item, condition, "auth", expressionAttributeNames);
    } catch (error) {
      console.error("Dynamo putItem error: ", error);
      throw new InternalServerError("Could not create auth item: " + error);
    }
  }

  async updateTokenTimestamp(
    token: string,
    alias: string,
    timestamp: number
  ): Promise<void> {
    await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          token: token,
          alias: alias,
        },
        UpdateExpression: "SET #ts = :ts",
        ExpressionAttributeNames: { "#ts": "timestamp" },
        ExpressionAttributeValues: { ":ts": timestamp },
      })
    );
  }

  async getAuthToken(token: string): Promise<AuthTokenRecord | null> {
    if (token === null || token === undefined || token.length === 0) {
      console.warn("getAuthToken called with invalid token");
      return null;
    }
    try {
      console.info("getAuthToken called with token:", token);
      const query = new QueryCommand({
        KeyConditionExpression: "#tk = :token",
        ExpressionAttributeNames: { "#tk": "token" },
        ExpressionAttributeValues: { ":token": token },
        TableName: this.tableName,
        IndexName: this.indexName,
      });
      console.info("Query params:", JSON.stringify({
        TableName: this.tableName,
        IndexName: this.indexName,
        KeyConditionExpression: query.input.KeyConditionExpression,
        ExpressionAttributeNames: query.input.ExpressionAttributeNames,
        ExpressionAttributeValues: query.input.ExpressionAttributeValues,
      }));
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
    } catch (error) {
      console.error("Dynamo getAuthToken error: ", error);
      console.error("Token: ", token);
      throw new InternalServerError("Could not get auth item: " + error);
    }
  }

  async deleteAuthToken(token: string): Promise<void> {
    try {
      const authToken = await this.getAuthToken(token);
      if (!authToken) {
        return;
      }
      const authKey = {
        token: token,
        alias: authToken.alias,
      };
      const params = {
        TableName: this.tableName,
        Key: authKey,
      };

      await this.client.send(new DeleteCommand(params));
    } catch (error) {
      console.error("Dynamo deleteItem error: ", error);
      throw new InternalServerError("Could not delete auth item: " + error);
    }
  }
}
