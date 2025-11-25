import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { DataPage } from "../../entities/DataPage";
import { BadRequestError, InternalServerError } from "../../errors/Error";

export interface PaginationParams<T> {
  keyConditionExpression: string;
  expressionValues: any;
  pageSize: number;
  mapItem: (item: any) => T;
  lastKey?: any;
  indexName?: string;
}

export abstract class DynamoInterface {
  readonly tableName;
  readonly indexName;

  private readonly _dynamo = new DynamoDBClient({ region: "us-west-2" });
  private readonly _client = DynamoDBDocumentClient.from(this.dynamo);

  protected constructor(tableName: string, indexName?: string) {
    this.tableName = tableName;
    this.indexName = indexName;
  }

  protected get client() {
    return this._client;
  }

  protected get dynamo() {
    return this._dynamo;
  }

  protected async getItem(key: any, indexName?: string) {
    try {
      const result = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: key,
        })
      );

      return result.Item;
    } catch (error) {
      console.error("Dynamo getItem error: ", error);
      throw new InternalServerError("Could not get item: " + error);
    }
  }

  protected async putItem(
    item: any,
    condition: string,
    description: string,
    expressionAttributeNames?: any
  ) {
    try {
      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: item,
          ConditionExpression: condition,
          ExpressionAttributeNames: expressionAttributeNames,
        })
      );
    } catch (error) {
      console.error("Dynamo putItem error: ", error);
      throw new InternalServerError("Could not put item: " + error);
    }
  }

  protected async getPageOfItems<T>(
    params: PaginationParams<T>
  ): Promise<DataPage<T>> {
    
    if (params.pageSize <= 0) {
    throw new BadRequestError("Page size must be greater than 0");
}

    try {
      const query = new QueryCommand({
        KeyConditionExpression: params.keyConditionExpression,
        ExpressionAttributeValues: params.expressionValues,
        TableName: this.tableName,
        IndexName: params.indexName,
        Limit: params.pageSize,
        ExclusiveStartKey: params.lastKey,
      });
      const data = await this.client.send(query);
      const hasMorePages = data.LastEvaluatedKey !== undefined;

      const items: T[] = data.Items ? data.Items.map(params.mapItem) : [];
      const lastEvaluatedKeyHandle = data.LastEvaluatedKey
        ? (data.LastEvaluatedKey.followee_handle as string)
        : undefined;
      return new DataPage<T>(items, hasMorePages, lastEvaluatedKeyHandle);
    } catch (error) {
      console.error("Dynamo getItem error: ", error);
      throw new InternalServerError("Could not get item page: " + error);
    }
  }
}
