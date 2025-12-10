import { DataPage } from "../../entities/DataPage";
import { DynamoInterface } from "./DynamoInterface";
import { StatusRecord } from "../../entities/StatusRecord";
import { InternalServerError } from "../../errors/Error";

export class DynamoStatusDao extends DynamoInterface {
  constructor(tableName: string) {
    super(tableName);
  }

  async getPage<T extends StatusRecord>(
    alias: string,
    pageSize: number,
    mapItem: (item: any) => T,
    lastTimestamp?: number
  ): Promise<DataPage<T>> {
    try {
      return await this.getPageOfItems<T>({
        keyConditionExpression: "user_alias = :userAlias",
        expressionValues: {
          ":userAlias": alias,
        },
        pageSize: pageSize,
        mapItem: mapItem,
        lastKey: lastTimestamp
          ? {
              user_alias: alias,
              timestamp: lastTimestamp,
            }
          : undefined,
        indexName: undefined,
        getLastKey: (key) => key.timestamp as number
      },
    false);
    } catch (error) {
      console.error("Dynamo getItem error: ", error);
      throw new InternalServerError("Could not get status item page: " + error);
    }
  }

  async putStatus(item: any): Promise<void> {
    try {
      const condition =
        "attribute_not_exists(user_alias) AND attribute_not_exists(#timestamp)";
      const expressionAttributeNames = {
        "#timestamp": "timestamp",
      };
      await this.putItem(
        item,
        condition,
        this.tableName,
        expressionAttributeNames
      );
    } catch (error) {
      console.error("Dynamo putItem error: ", error);
      throw new InternalServerError("Could not create status item: " + error);
    }
  }
}
