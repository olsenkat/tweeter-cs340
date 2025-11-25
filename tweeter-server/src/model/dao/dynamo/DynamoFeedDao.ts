import { DataPage } from "../../entities/DataPage";
import { FeedDao } from "../interfaces/FeedDao";
import { FeedRecord } from "../../entities/FeedRecord";
import { DynamoStatusDao } from "./DynamoStatusDao";
import { BadRequestError, InternalServerError } from "../../errors/Error";

export class DynamoFeedDao extends DynamoStatusDao implements FeedDao {
  constructor() {
    super("feed");
  }

  async getFeedPage(
    alias: string,
    pageSize: number,
    lastTimestamp?: number
  ): Promise<DataPage<FeedRecord>> {
    if (!alias || typeof alias !== "string") {
      throw new BadRequestError("User alias is required");
    }

    if (!pageSize || pageSize <=0) {
      throw new BadRequestError("Page size must be greater than 0");
    }
    try {
      return await this.getPage<FeedRecord>(
        alias,
        pageSize,
        (item) => {
          return {
            post: item.post,
            userAlias: item.user_alias,
            timestamp: item.timestamp,

            authorAlias: item.author_alias,
            authorFirstName: item.author_first_name,
            authorLastName: item.author_last_name,
            authorImageKey: item.author_image_key,
          } as FeedRecord;
        },
        lastTimestamp
      );
    } catch (error) {
      console.error("Dynamo getItem error: ", error);
      throw new InternalServerError("Could not get feed page: " + error);
    }
  }

  async addStatusToFeed(status: FeedRecord): Promise<void> {
    try {
      const item = {
        post: status.post,
        user_alias: status.userAlias,
        timestamp: status.timestamp,

        author_alias: status.authorAlias,
        author_first_name: status.authorFirstName,
        author_last_name: status.authorLastName,
        author_image_key: status.authorImageKey,
      };

      return await this.putStatus(item);
    } catch (error) {
      console.error("Dynamo putItem error: ", error);
      throw new InternalServerError("Could not put status item: " + error);
    }
  }
}
