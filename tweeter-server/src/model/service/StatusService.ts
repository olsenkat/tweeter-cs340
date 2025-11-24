import { StatusDto, UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { DataPage } from "../entities/DataPage";
import { StatusRecord } from "../entities/StatusRecord";
import { StoryRecord } from "../entities/StoryRecord";
import { FeedRecord } from "../entities/FeedRecord";
import { FollowService } from "./FollowService";
import { AuthService } from "./AuthService";
import { DaoFactory } from "../factory/DaoFactory";

export class StatusService extends Service {
  private followService: FollowService;
  private authService: AuthService;

  constructor(daoFactory: DaoFactory, authService: AuthService, followService: FollowService) {
    super(daoFactory);
    this.authService = authService;
    this.followService = followService;
  }

  ////////////////////////////////////////
  //          Pagination Functions
  ///////////////////////////////////////

  public async loadMoreFeedItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {

    await this.authService.validateToken(token);

    const feedItems = await this.daoFactory
      .getFeedDao()
      .getFeedPage(userAlias, pageSize, lastItem?.timestamp);

    const mapItemDto = async (item: FeedRecord): Promise<StatusDto> => {
      // TODO - optimize
      const imageUrl = await this.getImageUrl(item.authorImageKey);
      const user = {
        alias: item.authorAlias,
        firstName: item.authorFirstName,
        lastName: item.authorLastName,
        imageUrl: imageUrl,
      } as UserDto;
      return this.convertStatusDto<FeedRecord>(item, user);
    };

    return await this.loadMoreItems<FeedRecord>(feedItems, mapItemDto);
  }

  public async loadMoreStoryItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {

    await this.authService.validateToken(token);

    const feedItems = await this.daoFactory
      .getStoryDao()
      .getStoryPage(userAlias, pageSize, lastItem?.timestamp);

    // TODO - optimize
    const mapItemDto = async (item: StoryRecord): Promise<StatusDto> => {
      const imageUrl = await this.getImageUrl(item.imageKey);
      const user = {
        alias: item.userAlias,
        firstName: item.firstName,
        lastName: item.lastName,
        imageUrl: imageUrl,
      } as UserDto;
      return this.convertStatusDto<StoryRecord>(item, user);
    };

    return await this.loadMoreItems<StoryRecord>(feedItems, mapItemDto);
  }

  ////////////////////////////////////////
  //          Status Functions
  ///////////////////////////////////////

  public async postStatus(token: string, newStatus: StatusDto): Promise<void> {
    // Pause so we can see the logging out message.
    // await new Promise((f) => setTimeout(f, 2000));

    await this.authService.validateToken(token);

    let status: StatusDto = {
      post: newStatus.post,
      user: newStatus.user,
      timestamp: Date.now()
    };
    // Post the status
    await this.postFeed(token, status);
    await this.postStory(status);
  }

  ///////////////////////////////////
  //           Post Helper Functions
  //////////////////////////////////

  private async postStory(status: StatusDto) {
    const user = await this.getUser(status.user.alias);

    // Create Story Record
    const storyRecord = {
      post: status.post,
      userAlias: status.user.alias,
      timestamp: status.timestamp,

      firstName: status.user.firstName,
      lastName: status.user.lastName,
      imageKey: user?.imageKey, // TODO - optimize
    } as StoryRecord;

    await this.daoFactory.getStoryDao().addStatusToStory(storyRecord);
  }

  private async postFeed(token: string, status: StatusDto) {
    const user = await this.getUser(status.user.alias);
    const followers = await this.getFollowers(token, status.user.alias);
    if (!user) {
      return;
    }

    // TODO - Will need to be optimized - do batch write
    for (const follower of followers) {
      // Create Feed Record
      const feedRecord = {
        post: status.post,
        userAlias: follower.alias,
        timestamp: status.timestamp,

        authorAlias: user.alias,
        authorFirstName: user.firstName,
        authorLastName: user.lastName,
        authorImageKey: user.imageKey,
      } as FeedRecord;

      await this.daoFactory.getFeedDao().addStatusToFeed(feedRecord);
    }
  }

  private async getFollowers(token: string, alias: string) {
    let lastFollower: UserDto | null = null;
    const followers: UserDto[] = [];
    // TODO - optimize
    while (true) {
      const [page, isMore] = await this.followService.loadMoreFollowers(
        token,
        alias,
        25,
        lastFollower
      );
      page.forEach((user) => {
        followers.push(user);
      });
      if (!isMore) {
        break;
      }
      lastFollower = page[page.length-1];
    }
    return followers;
  }

  private async getUser(alias: string) {
    return await this.daoFactory.getUserDao().getUser(alias);
  }

  ///////////////////////////////////
  //           Pagination Helper Functions
  //////////////////////////////////

  private async getImageUrl(imageKey: string): Promise<string> {
    return await this.daoFactory.getS3Dao().getImageUrl(imageKey);
  }

  private convertStatusDto<T extends StatusRecord>(
    item: T,
    user: UserDto
  ) {
    return {
      post: item.post,
      user: user,
      timestamp: item.timestamp,
    } as StatusDto;
  }

  public async loadMoreItems<T extends StatusRecord>(
    items: DataPage<T>,
    mapItemDto: (item: T) => Promise<StatusDto>
  ): Promise<[StatusDto[], boolean]> {
    const statusRecords = items.values;

    const dtos: StatusDto[] = [];

    // TODO - Will need to optimize this.
    for (const record of statusRecords) {
      dtos.push(await mapItemDto(record));
    }

    const hasMore = items.hasMorePages;
    return [dtos, hasMore];
  }
}
