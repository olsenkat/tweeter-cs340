import { StatusDto } from "tweeter-shared";
import { DataPage } from "../../entities/DataPage";

export interface FeedDao {
  getFeedPage(
    alias: string,
    pageSize: number,
    lastStatus: StatusDto | null
  ): Promise<DataPage<StatusDto>>;
  addStatusToFeed(alias: string, status: StatusDto): Promise<void>;
}
