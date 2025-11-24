import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { FollowDao } from "../interfaces/FollowDao";
import { UserDao } from "../interfaces/UserDao";
import { DataPage } from "../../entities/DataPage";
import { Follows } from "../../entities/Follows";
import { DynamoInterface } from "./DynamoInterface";
import { UserRecord } from "../../entities/UserRecord";

export class DynamoFollowDao extends DynamoInterface implements FollowDao {
  private userDao: UserDao;

  constructor(userDao: UserDao) {
    super("follows", "follows_index");
    this.userDao = userDao;
  }

  async follow(followerAlias: string, followeeAlias: string): Promise<void> {
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
    const condition =
      "attribute_not_exists(follower_handle)";
    await this.putItem(item, condition, "follow");
  }

  async unfollow(followerAlias: string, followeeAlias: string): Promise<void> {
    await this.getCheckUser(followerAlias);
    await this.getCheckUser(followeeAlias);
    await this.deleteItem(followerAlias, followeeAlias);
  }

  async isFollower(
    followerAlias: string,
    followeeAlias: string
  ): Promise<boolean> {
    const followKey = {
      follower_handle: followerAlias,
      followee_handle: followeeAlias,
    };
    const followItem = await this.getItem(followKey);
    return !!followItem;
  }

  async getFollowersCount(alias: string): Promise<number> {
    const params: QueryCommandInput = {
      KeyConditionExpression: "followee_handle = :followeeHandle",
      ExpressionAttributeValues: {
        ":followeeHandle": alias,
      },
      TableName: this.tableName,
      IndexName: this.indexName,
      Select: "COUNT",
    };
    const data = await this.client.send(new QueryCommand(params));
    return data.Count ?? 0;
  }

  async getFolloweesCount(alias: string): Promise<number> {
    const params: QueryCommandInput = {
      KeyConditionExpression: "follower_handle = :followerHandle",
      ExpressionAttributeValues: {
        ":followerHandle": alias,
      },
      TableName: this.tableName,
      Select: "COUNT",
    };
    const data = await this.client.send(new QueryCommand(params));
    return data.Count ?? 0;
  }

  async getFollowersPage(
    targetUserAlias: string,
    pageSize: number,
    lastFollowerHandle?: string
  ): Promise<DataPage<Follows>> {
    return await this.getPageOfFollowers(
      targetUserAlias,
      pageSize,
      lastFollowerHandle
    );
  }

  async getFolloweesPage(
    targetUserAlias: string,
    pageSize: number,
    lastFolloweeHandle?: string
  ): Promise<DataPage<Follows>> {
    return await this.getPageOfFollowees(
      targetUserAlias,
      pageSize,
      lastFolloweeHandle
    );
  }

  /////////////////////////////////////////
  // Helper Functions
  /////////////////////////////////////////

  private async getCheckUser(userHandle: string): Promise<UserRecord> {
    const userDto = await this.userDao.getUser(userHandle);

    if (!userDto) {
      throw new Error("User Handle not found: " + userHandle);
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
      throw new Error("Could not delete follow item");
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
    });
  }
}
