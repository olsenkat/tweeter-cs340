import { StatusDto } from "tweeter-shared";
import { DataPage } from "../../entities/DataPage";
import { StoryRecord } from "../../entities/StoryRecord";
import { StatusRecord } from "../../entities/StatusRecord";

export interface StoryDao {
  getStoryPage(
    alias: string,
    pageSize: number,
    lastTimestamp?: number
  ): Promise<DataPage<StoryRecord>>;
  addStatusToStory(status: StoryRecord): Promise<void>;
}
