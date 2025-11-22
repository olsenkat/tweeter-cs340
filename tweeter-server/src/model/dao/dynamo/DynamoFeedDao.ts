import { DataPage } from "../../entities/DataPage";
import { FeedDao } from "../interfaces/FeedDao";
import { FeedRecord } from "../../entities/FeedRecord";
import { DynamoStatusDao } from "./DynamoStatusDao";

export class DynamoFeedDao extends DynamoStatusDao implements FeedDao {
  constructor() {
    super("feed");
  }

  async getFeedPage(
    alias: string,
    pageSize: number,
    lastTimestamp: number | null
  ): Promise<DataPage<FeedRecord>> {
    return await this.getPage<FeedRecord>(alias, pageSize, lastTimestamp, (item) => {
      return {
        post: item.post,
        userAlias: item.user_alias,
        timestamp: item.timestamp,

        authorAlias: item.author_alias,
        authorFirstName: item.author_first_name,
        authorLastName: item.author_last_name,
        authorImageKey: item.author_image_key,
      } as FeedRecord;
    });
  }

  async addStatusToFeed(status: FeedRecord): Promise<void> {
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
  }
}
