import { StatusDto } from "tweeter-shared";
import { DataPage } from "../../entities/DataPage";
import { Follows } from "../../entities/Follows";

export interface FollowDao {
  follow(followerAlias: string, followeeAlias: string): Promise<void>;

  unfollow(followerAlias: string, followeeAlias: string): Promise<void>;

  getFollowersPage(
    targetUserAlias: string,
    pageSize: number,
    lastFollowerHandle?: string
  ): Promise<DataPage<Follows>>;

  getFolloweesPage(
    targetUserAlias: string,
    pageSize: number,
    lastFolloweeHandle?: string
  ): Promise<DataPage<Follows>>;

  getFollowersCount(alias: string): Promise<number>;
  getFolloweesCount(alias: string): Promise<number>;
  isFollower(followerAlias: string, followeeAlias: string): Promise<boolean>;
}
