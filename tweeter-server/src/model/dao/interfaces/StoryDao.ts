import { StatusDto } from "tweeter-shared";
import { DataPage } from "../../entities/DataPage";

export interface StoryDao {
  getStoryPage(
    alias: string,
    pageSize: number,
    lastStatus: StatusDto | null
  ): Promise<DataPage<StatusDto>>;
  addStatusToStory(alias: string, status: StatusDto): Promise<void>;
}
