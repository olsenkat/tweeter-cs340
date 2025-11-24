import { StatusDto } from "tweeter-shared";
import { DataPage } from "../../entities/DataPage";
import { FeedRecord } from "../../entities/FeedRecord";
import { StatusRecord } from "../../entities/StatusRecord";

export interface FeedDao {
  getFeedPage(
    alias: string,
    pageSize: number,
    lastTimestamp?: number
  ): Promise<DataPage<FeedRecord>>;
  addStatusToFeed(status: FeedRecord): Promise<void>;
}
