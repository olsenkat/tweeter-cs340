import { UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { UserRecord } from "../entities/UserRecord";
import { Follows } from "../entities/Follows";
import { DataPage } from "../entities/DataPage";
import { AuthService } from "./AuthService";
import { DaoFactory } from "../factory/DaoFactory";
import { BadRequestError } from "../errors/Error";

export class FollowService extends Service {
  private authService: AuthService;

  constructor(daoFactory: DaoFactory, authService: AuthService) {
    super(daoFactory);
    this.authService = authService;
  }

  public async loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    if (pageSize <= 0) {
      throw new BadRequestError("Page size must be > 0");
    }
    console.log("Validating token in loadMoreFollowees: ", token);
    await this.authService.validateToken(token);

    const items = await this.daoFactory
      .getFollowDao()
      .getFolloweesPage(userAlias, pageSize, lastItem?.alias);
    const mapKey = (item: Follows) => {
      return item.followee_handle;
    };
    return await this.loadMoreItems(items, mapKey);
  }

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    if (token === null || token === undefined || token.length === 0) {
      console.warn("loadMoreFollowers called with invalid token");
      throw new BadRequestError("Invalid token");
    }

    if (pageSize <= 0) {
      throw new BadRequestError("Page size must by > 0");
    }

    await this.authService.validateToken(token);

    const items = await this.daoFactory
      .getFollowDao()
      .getFollowersPage(userAlias, pageSize, lastItem?.alias);
    const mapKey = (item: Follows) => {
      return item.follower_handle;
    };
    return await this.loadMoreItems(items, mapKey);
  }

  public async getIsFollowerStatus(
    token: string,
    user: UserDto,
    selectedUser: UserDto
  ): Promise<boolean> {
    console.log("Validating token in getIsFollowerStatus: ", token);
    await this.authService.validateToken(token);
    return await this.daoFactory
      .getFollowDao()
      .isFollower(user.alias, selectedUser.alias);
  }

  public async getFolloweeCount(token: string, user: UserDto): Promise<number> {
    console.log("Validating token in getFolloweeCount: ", token);
    await this.authService.validateToken(token);
    return await this.daoFactory.getFollowDao().getFolloweesCount(user.alias);
  }

  public async getFollowerCount(token: string, user: UserDto): Promise<number> {
    console.log("Validating token in getFollowerCount: ", token);
    await this.authService.validateToken(token);
    return await this.daoFactory.getFollowDao().getFollowersCount(user.alias);
  }

  public async follow(
    token: string,
    userToFollow: UserDto
  ): Promise<[followerCount: number, followeeCount: number]> {
    console.log("Validating token in follow: ", token);
    const { alias: followerAlias } = await this.authService.validateToken(
      token
    );
    const followeeAlias = userToFollow.alias;

    await this.daoFactory
      .getFollowDao()
      .follow(followerAlias, followeeAlias)
      .catch((err) => {
        if (err.message.includes("not found")) {
          throw new BadRequestError("User to follow does not exist");
        }
        throw err;
      });

    // TODO - optomize, do in parallel
    const followerCount = await this.getFollowerCount(token, userToFollow);
    const followeeCount = await this.getFolloweeCount(token, userToFollow);

    return [followerCount, followeeCount];
  }

  public async unfollow(
    token: string,
    userToUnfollow: UserDto
  ): Promise<[followerCount: number, followeeCount: number]> {
    console.log("Validating token in unfollow: ", token);
    const { alias: followerAlias } = await this.authService.validateToken(
      token
    );
    const followeeAlias = userToUnfollow.alias;

    await this.daoFactory
      .getFollowDao()
      .unfollow(followerAlias, followeeAlias)
      .catch((err) => {
        if (err.message.includes("not found")) {
          throw new BadRequestError("User to unfollow does not exist");
        }
        throw err;
      });

    // TODO - optomize, do in parallel
    const followerCount = await this.getFollowerCount(token, userToUnfollow);
    const followeeCount = await this.getFolloweeCount(token, userToUnfollow);

    return [followerCount, followeeCount];
  }

  ///////////////////////////////////
  //           Helper Functions
  //////////////////////////////////

  public async getFollowers(alias: string) {
    let lastFollower: string | undefined = undefined;
    const followers: string[] = [];
    const pageSize = 100;
    while (true) {
      const items = await this.daoFactory
        .getFollowDao()
        .getFollowersPage(alias, pageSize, lastFollower);

        const pageAliases = items.values.map(item => item.follower_handle);

        followers.push(...pageAliases);

        if (!items.hasMorePages) {
          break
        }
        
        if (pageAliases.length > 0) {
          lastFollower = pageAliases[pageAliases.length - 1];
        }  
    }
    return followers
  }

  public async loadMoreItems<U>(
    items: DataPage<U>,
    mapKey: (item: U) => string,
    // mapItemDto: (item: UserRecord) => Promise<UserDto>
  ): Promise<[UserDto[], boolean]> {
    const mapItemDto = async (user: UserRecord): Promise<UserDto> => {
      const imageUrl = await this.daoFactory
        .getS3Dao()
        .getImageUrl(user.imageKey);
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        alias: user.alias,
        imageUrl: imageUrl,
      } as UserDto;
    }

    const keys: string[] = items.values.map(mapKey);
    const userRecords = await this.daoFactory.getUserDao().batchGetUsers(keys);

    const dtos: UserDto[] = await Promise.all(
      userRecords.map((record) => mapItemDto(record))
    );

    const hasMore = items.hasMorePages;
    return [dtos, hasMore];
  }

}
