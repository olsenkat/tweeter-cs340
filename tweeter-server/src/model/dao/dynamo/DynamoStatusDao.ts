import { DataPage } from "../../entities/DataPage";
import { DynamoInterface } from "./DynamoInterface";
import { StatusRecord } from "../../entities/StatusRecord";

export class DynamoStatusDao extends DynamoInterface {
  constructor(tableName: string) {
    super(tableName);
  }

  async getPage<T extends StatusRecord>(
    alias: string,
    pageSize: number,
    lastTimestamp: number | null,
    mapItem: (item: any) => T
  ): Promise<DataPage<T>> {
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
    });
  }

  async putStatus(item: any): Promise<void> {
    const condition =
      "attribute_not_exists(user_alias) AND attribute_not_exists(timestamp)";
    await this.putItem(item, condition, this.tableName);
  }
}
