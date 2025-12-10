import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { FollowDao } from "../interfaces/FollowDao";
import { UserDao } from "../interfaces/UserDao";
import { DataPage } from "../../entities/DataPage";
import { Follows } from "../../entities/Follows";
import { DynamoInterface } from "./DynamoInterface";
import { UserRecord } from "../../entities/UserRecord";
import { BadRequestError, InternalServerError } from "../../errors/Error";

export class DynamoFollowDao extends DynamoInterface implements FollowDao {
  private userDao: UserDao;

  constructor(userDao: UserDao) {
    super("follows", "follows_index");
    this.userDao = userDao;
  }

  async follow(followerAlias: string, followeeAlias: string): Promise<void> {
    try {
      const follower = await this.getCheckUser(followerAlias);
      const followee = await this.getCheckUser(followeeAlias);

      const followerName: string = this.getFullName(follower);
      const followeeName: string = this.getFullName(followee);

      const item = {
        follower_handle: followerAlias,
        followee_handle: followeeAlias,
        follower_name: followerName,
        followee_name: followeeName,
      };
      const condition = "attribute_not_exists(follower_handle)";
      await this.putItem(item, condition, "follow");
    } catch (error) {
      console.error("Dynamo putItem error: ", error);
      throw new InternalServerError("Could not create follow item: " + error);
    }
  }

  async unfollow(followerAlias: string, followeeAlias: string): Promise<void> {
    try {
      await this.getCheckUser(followerAlias);
      await this.getCheckUser(followeeAlias);
      await this.deleteItem(followerAlias, followeeAlias);
    } catch (error) {
      console.error("Dynamo deleteItem error: ", error);
      throw new InternalServerError("Could not delete follow item: " + error);
    }
  }

  async isFollower(
    followerAlias: string,
    followeeAlias: string
  ): Promise<boolean> {
    try {
      const followKey = {
        follower_handle: followerAlias,
        followee_handle: followeeAlias,
      };
      const followItem = await this.getItem(followKey);
      return !!followItem;
    } catch (error) {
      console.error("Dynamo getItem error: ", error);
      throw new InternalServerError("Could not get is follower: " + error);
    }
  }

  async getFollowersCount(alias: string): Promise<number> {
    let count = 0;
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;

    do {
      try {
        const params: QueryCommandInput = {
          KeyConditionExpression: "followee_handle = :followeeHandle",
          ExpressionAttributeValues: {
            ":followeeHandle": alias,
          },
          TableName: this.tableName,
          IndexName: this.indexName,
          Select: "COUNT",
          ExclusiveStartKey: lastEvaluatedKey
        };
        const data = await this.client.send(new QueryCommand(params));
        // return data.Count ?? 0;
        count += data.Count ?? 0;
        lastEvaluatedKey = data.LastEvaluatedKey;
      } catch (error) {
        console.error("Dynamo getItem error: ", error);
        throw new InternalServerError("Could not get follower count: " + error);
      }
    } while (lastEvaluatedKey);
    return count;
  }

  async getFolloweesCount(alias: string): Promise<number> {
    let count = 0;
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;

    do {
      try {
        const params: QueryCommandInput = {
          KeyConditionExpression: "follower_handle = :followerHandle",
          ExpressionAttributeValues: {
            ":followerHandle": alias,
          },
          TableName: this.tableName,
          Select: "COUNT",
          ExclusiveStartKey: lastEvaluatedKey
        };
        const data = await this.client.send(new QueryCommand(params));
        count += data.Count ?? 0;
        lastEvaluatedKey = data.LastEvaluatedKey;
        // return data.Count ?? 0;
      } catch (error) {
        console.error("Dynamo getItem error: ", error);
        throw new InternalServerError("Could not get followee count: " + error);
      }
    } while (lastEvaluatedKey);
    return count;
  }

  async getFollowersPage(
    targetUserAlias: string,
    pageSize: number,
    lastFollowerHandle?: string
  ): Promise<DataPage<Follows>> {
    if (!targetUserAlias || typeof targetUserAlias !== "string") {
      throw new BadRequestError("User alias is required");
    }

    if (!pageSize || pageSize <= 0) {
      throw new BadRequestError("Page size must be greater than 0");
    }
    try {
      return await this.getPageOfFollowers(
        targetUserAlias,
        pageSize,
        lastFollowerHandle
      );
    } catch (error) {
      console.error("Dynamo getItem error: ", error);
      throw new InternalServerError("Could not get follower page: " + error);
    }
  }

  async getFolloweesPage(
    targetUserAlias: string,
    pageSize: number,
    lastFolloweeHandle?: string
  ): Promise<DataPage<Follows>> {
    if (!targetUserAlias || typeof targetUserAlias !== "string") {
      throw new BadRequestError("User alias is required");
    }

    if (!pageSize || pageSize <= 0) {
      throw new BadRequestError("Page size must be greater than 0");
    }
    try {
      return await this.getPageOfFollowees(
        targetUserAlias,
        pageSize,
        lastFolloweeHandle
      );
    } catch (error) {
      console.error("Dynamo getItem error: ", error);
      throw new InternalServerError("Could not get follower page: " + error);
    }
  }

  /////////////////////////////////////////
  // Helper Functions
  /////////////////////////////////////////

  private async getCheckUser(userHandle: string): Promise<UserRecord> {
    const userDto = await this.userDao.getUser(userHandle);

    if (!userDto) {
      throw new BadRequestError("User Handle not found: " + userHandle);
    } else {
      return userDto;
    }
  }

  private getFullName(user: UserRecord) {
    return user.firstName + " " + user.lastName;
  }

  /////////////////////////////////////////
  // Basic Database Functions
  /////////////////////////////////////////

  private async deleteItem(follower_handle: string, followee_handle: string) {
    try {
      await this.client.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: {
            follower_handle: follower_handle,
            followee_handle: followee_handle,
          },
        })
      );
    } catch (err) {
      console.error("Failed to delete follow item", err);
      throw new InternalServerError("Could not delete follow item");
    }
  }

  // Get a page of followees for a given follower from the main table
  async getPageOfFollowees(
    followerHandle: string,
    pageSize: number,
    lastFolloweeHandle: string | undefined
  ): Promise<DataPage<Follows>> {
    return await this.getPageOfItems<Follows>({
      keyConditionExpression: "follower_handle = :followerHandle",
      expressionValues: { ":followerHandle": followerHandle },
      pageSize: pageSize,
      mapItem: (item) =>
        new Follows(
          item.follower_handle,
          item.follower_name,
          item.followee_handle,
          item.followee_name
        ),
      lastKey: lastFolloweeHandle
        ? {
            follower_handle: followerHandle,
            followee_handle: lastFolloweeHandle,
          }
        : undefined,
      indexName: undefined,
      getLastKey: (key) => key.followee_handle as string
    });
  }

  // Get a page of followers for a given followee through the Index
  async getPageOfFollowers(
    followeeHandle: string,
    pageSize: number,
    lastFollowerHandle: string | undefined
  ): Promise<DataPage<Follows>> {
    return await this.getPageOfItems<Follows>({
      keyConditionExpression: "followee_handle = :followeeHandle",
      expressionValues: { ":followeeHandle": followeeHandle },
      pageSize: pageSize,
      mapItem: (item) =>
        new Follows(
          item.follower_handle,
          item.follower_name,
          item.followee_handle,
          item.followee_name
        ),
      lastKey: lastFollowerHandle
        ? {
            followee_handle: followeeHandle,
            follower_handle: lastFollowerHandle,
          }
        : undefined,
      indexName: this.indexName,
      getLastKey: (key) => key.follower_handle as string
    });
  }

  
}
