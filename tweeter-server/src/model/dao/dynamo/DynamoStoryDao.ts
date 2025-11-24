import { DataPage } from "../../entities/DataPage";
import { StoryDao } from "../interfaces/StoryDao";
import { DynamoStatusDao } from "./DynamoStatusDao";
import { StoryRecord } from "../../entities/StoryRecord";

export class DynamoStoryDao extends DynamoStatusDao implements StoryDao {
  constructor() {
    super("story");
  }

  async getStoryPage(
    alias: string,
    pageSize: number,
    lastTimestamp?: number
  ): Promise<DataPage<StoryRecord>> {
    return await this.getPage<StoryRecord>(alias, pageSize, (item) => {
      return {
        post: item.post,
        userAlias: item.user_alias,
        timestamp: item.timestamp,

        firstName: item.first_name,
        lastName: item.last_name,
        imageKey: item.image_key,
      } as StoryRecord;
    }, lastTimestamp);
  }

  async addStatusToStory(status: StoryRecord): Promise<void> {
    const item = {
      post: status.post,
      user_alias: status.userAlias,
      timestamp: status.timestamp,

      first_name: status.firstName,
      last_name: status.lastName,
      image_key: status.imageKey,
    };

    return await this.putStatus(item);
  }
}
