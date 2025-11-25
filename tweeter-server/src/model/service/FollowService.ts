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

  constructor (daoFactory: DaoFactory, authService: AuthService) {
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

    await this.authService.validateToken(token);

    const items = await this.daoFactory
      .getFollowDao()
      .getFolloweesPage(userAlias, pageSize, lastItem?.alias);
    const mapKey = (item: Follows) => {
      return item.followee_handle;
    };
    return await this.loadMore(items, mapKey);
  }

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {

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
    return await this.loadMore(items, mapKey);
  }

  public async getIsFollowerStatus(
    token: string,
    user: UserDto,
    selectedUser: UserDto
  ): Promise<boolean> {
    await this.authService.validateToken(token);
    return await this.daoFactory.getFollowDao().isFollower(user.alias, selectedUser.alias)
  }

  public async getFolloweeCount(token: string, user: UserDto): Promise<number> {
    await this.authService.validateToken(token);
    return await this.daoFactory.getFollowDao().getFolloweesCount(user.alias);
  }

  public async getFollowerCount(token: string, user: UserDto): Promise<number> {

    await this.authService.validateToken(token);
    return await this.daoFactory.getFollowDao().getFollowersCount(user.alias);
  }

  public async follow(
    token: string,
    userToFollow: UserDto
  ): Promise<[followerCount: number, followeeCount: number]> {

    const { alias: followerAlias}  = await this.authService.validateToken(token);
    const followeeAlias = userToFollow.alias;

    await this.daoFactory.getFollowDao().follow(followerAlias, followeeAlias).catch(err => {
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

    const { alias: followerAlias } = await this.authService.validateToken(token);
    const followeeAlias = userToUnfollow.alias;

    await this.daoFactory.getFollowDao().unfollow(followerAlias, followeeAlias).catch(err => {
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
  public async loadMore(
    items: DataPage<Follows>,
    mapKey: (item: Follows) => string
  ): Promise<[UserDto[], boolean]> {
    const getItem = this.daoFactory.getUserDao().getUser.bind(
        this.daoFactory.getUserDao()
    );
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
    };
    return await this.loadMoreItems<UserDto, Follows, UserRecord>(
      items,
      mapKey,
      getItem,
      mapItemDto
    );
  }

  public async loadMoreItems<T, U, V>(
        items: DataPage<U>,
        mapKey: (item: U) => string,
        getItem: (key: string) => Promise<V | null>,
        mapItemDto: (item: V) => Promise<T>
      ): Promise<[T[], boolean]> {
        const records = items.values;
        const keys: string[] = [];
    
        records.forEach((item) => {
          keys.push(mapKey(item));
        });

        const dtos: T[] = []

        // May need to optimize this?
        for (const key of keys) {
          const item = await getItem(key)
          if (!item) {
            // Do i need to throw an error here
            continue;
          }
          dtos.push(await mapItemDto(item))
        }
    
        const hasMore = items.hasMorePages;
        return [dtos, hasMore]
      }
}
