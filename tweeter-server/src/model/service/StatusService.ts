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
    // Pause so we can see the logging out message.
    // await new Promise((f) => setTimeout(f, 2000));

    console.log("Validating token in StatusService.postStatus: ", token);
    await this.authService.validateToken(token);
    console.log("Token validated in StatusService.postStatus");

    let status: StatusDto = {
      post: newStatus.post,
      user: newStatus.user,
      timestamp: Date.now(),
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
    if (!user) {
      console.error("User not found in postStory: ", status.user.alias);
      return;
    }
    console.log("User retrieved in postStory: ", user);

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
    console.info("TOKEN in postFeed: ", token);
    if (!token) {
      console.warn("No token provided to postFeed.");
      throw Error("No token provided");
    }

    const user = await this.getUser(status.user.alias);

    if (!user) {
      console.info("User not found in postFeed: ", status.user.alias);
      return;
    }

    console.info("User retrieved in postFeed: ", user);

    const message = {
      authorUser: {
        alias: status.user.alias,
        firstName: status.user.firstName,
        lastName: status.user.lastName,
        imageKey: status.user.imageUrl
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

    console.info("postFeed message sent to SQS: ", message);
  }

  // private async postFeed(token: string, status: StatusDto) {
  //   console.info("TOKEN in postFeed: ", token);
  //   if (!token) {
  //     console.info("No token provided to postFeed.");
  //     throw Error("No token provided");
  //   }
  //   const user = await this.getUser(status.user.alias);
  //   if (!user) {
  //     console.info("User not found in postFeed: ", status.user.alias);
  //     return;
  //   }
  //   console.info("User retrieved in postFeed: ", user);
  //   const followers = await this.getFollowers(token, status.user.alias);

  //   if (followers.length === 0) {
  //     console.info("No followers found for user: ", status.user.alias);
  //     return;
  //   }
  //   console.info(`${followers.length} followers retrieved in postFeed.`);

  //   // TODO - Will need to be optimized - do batch write
  //   // for (const follower of followers) {
  //     // Create Feed Record
  //     const feedRecords: FeedRecord[] = followers.map(follower => ({
  //       post: status.post,
  //       userAlias: follower.alias,
  //       timestamp: status.timestamp,

  //       authorAlias: user.alias,
  //       authorFirstName: user.firstName,
  //       authorLastName: user.lastName,
  //       authorImageKey: user.imageKey,
  //     } as FeedRecord ))

  //     // await this.daoFactory.getFeedDao().addStatusToFeed(feedRecord);
  //   // }

  //   try {
  //     const params = {
  //     MessageBody: JSON.stringify({
  //       feedRecords
  //     }),
  //     QueueUrl: this.queueUrl
  //   }
  //     const data = await this.sqsClient.send(new SendMessageCommand(params));
  //     console.info("SQS messages sent successfully.");
  //   }
  //   catch (err) {
  //     console.error("Failed to send feed records to SQS: ", err)
  //     throw err;
  //   }
  // }

  // public async getFollowers(token: string, alias: string) {
  //   let lastFollower: UserDto | null = null;
  //   const followers: UserDto[] = [];
  //   // TODO - optimize
  //   if (!token) {
  //     console.warn("No token provided to getFollowers.");
  //     throw Error("No token provided");
  //   }
  //   while (true) {
  //     const [page, isMore] = await this.followService.loadMoreFollowers(
  //       token,
  //       alias,
  //       25,
  //       lastFollower
  //     );
  //     page.forEach((user) => {
  //       followers.push(user);
  //     });
  //     if (!isMore) {
  //       break;
  //     }
  //     lastFollower = page[page.length - 1];
  //   }
  //   return followers;
  // }

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

    const dtos: StatusDto[] = [];

    // TODO - Will need to optimize this.
    for (const record of statusRecords) {
      dtos.push(await mapItemDto(record));
    }

    const hasMore = items.hasMorePages;
    return [dtos, hasMore];
  }
}
