import { DataPage } from "../../entities/DataPage";
import { StoryDao } from "../interfaces/StoryDao";
import { DynamoStatusDao } from "./DynamoStatusDao";
import { StoryRecord } from "../../entities/StoryRecord";
import { BadRequestError, InternalServerError } from "../../errors/Error";

export class DynamoStoryDao extends DynamoStatusDao implements StoryDao {
  constructor() {
    super("story");
  }

  async getStoryPage(
    alias: string,
    pageSize: number,
    lastTimestamp?: number
  ): Promise<DataPage<StoryRecord>> {
    try {
      if (!alias || typeof alias !== "string") {
        throw new BadRequestError("User alias is required");
      }

      if (!pageSize || pageSize <=0) {
        throw new BadRequestError("Page size must be greater than 0");
      }
      return await this.getPage<StoryRecord>(
        alias,
        pageSize,
        (item) => {
          return {
            post: item.post,
            userAlias: item.user_alias,
            timestamp: item.timestamp,

            firstName: item.first_name,
            lastName: item.last_name,
            imageKey: item.image_key,
          } as StoryRecord;
        },
        lastTimestamp
      );
    } catch (error) {
      console.error("Dynamo getStoryPage error: ", error);
      throw new InternalServerError("Could not get story page: " + error);
    }
  }

  async addStatusToStory(status: StoryRecord): Promise<void> {
    try {
      const item = {
        post: status.post,
        user_alias: status.userAlias,
        timestamp: status.timestamp,

        first_name: status.firstName,
        last_name: status.lastName,
        image_key: status.imageKey,
      };

      return await this.putStatus(item);
    } catch (error) {
      console.error("Dynamo addStatusToStory error: ", error);
      throw new InternalServerError("Could not add Status to story: " + error);
    }
  }
}
