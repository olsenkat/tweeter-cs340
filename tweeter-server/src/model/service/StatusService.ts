import { StatusDto, UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { DataPage } from "../entities/DataPage";
import { StatusRecord } from "../entities/StatusRecord";
import { StoryRecord } from "../entities/StoryRecord";
import { FeedRecord } from "../entities/FeedRecord";
import { FollowService } from "./FollowService";
import { AuthService } from "./AuthService";
import { DaoFactory } from "../factory/DaoFactory";

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { UserRecord } from "../entities/UserRecord";

export class StatusService extends Service {
  private followService: FollowService;
  private authService: AuthService;
  private sqsClient: SQSClient;
  private queueUrl: string;

  constructor(
    daoFactory: DaoFactory,
    authService: AuthService,
    followService: FollowService
  ) {
    super(daoFactory);
    this.authService = authService;
    this.followService = followService;

    this.sqsClient = new SQSClient({ region: "us-west-2" });
    this.queueUrl = process.env.FEED_UPDATE_QUEUE_URL!;
  }

  ////////////////////////////////////////
  // I love you!!!!         Pagination Functions
  ///////////////////////////////////////

  public async loadMoreFeedItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    console.log("Validating token in loadMoreFeedItems: ", token);
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
    console.log("Validating token in loadMoreStoryItems: ", token);
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
    let status: StatusDto = {
      post: newStatus.post,
      user: newStatus.user,
      timestamp: Date.now(),
    };

    const [user, tokenResult] = await Promise.all([
      this.getUser(status.user.alias),
      this.authService.validateToken(token)
    ])
    
    // await this.authService.validateToken(token);
    // const user = await this.getUser(status.user.alias);

    if (!user) {
      console.warn("User not found in postStatus: ", status.user.alias);
      return;
    }

    // Post the status
    setImmediate(() => this.postStory(status, user))
    await this.postFeed(status, user);

  }

  ///////////////////////////////////
  //           Post Helper Functions
  //////////////////////////////////

  private async postStory(status: StatusDto, user: UserRecord) {
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

  private async postFeed(status: StatusDto, user: UserRecord) {
    const message = {
      authorUser: {
        alias: status.user.alias,
        firstName: status.user.firstName,
        lastName: status.user.lastName,
        imageKey: user.imageKey
      },
      post: status.post,
      timestamp: status.timestamp,
    };

    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
      })
    );

    // console.info("postFeed message sent to SQS: ", message);
  }

  public async getUser(alias: string) {
    return await this.daoFactory.getUserDao().getUser(alias);
  }

  ///////////////////////////////////
  //           Pagination Helper Functions
  //////////////////////////////////

  private async getImageUrl(imageKey: string): Promise<string> {
    return await this.daoFactory.getS3Dao().getImageUrl(imageKey);
  }

  private convertStatusDto<T extends StatusRecord>(item: T, user: UserDto) {
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

    const dtos: StatusDto[] = await Promise.all(
      statusRecords.map(mapItemDto));

    // const dtos: StatusDto[] = [];

    // // TODO - Will need to optimize this.
    // for (const record of statusRecords) {
    //   dtos.push(await mapItemDto(record));
    // }

    const hasMore = items.hasMorePages;
    return [dtos, hasMore];
  }
}
