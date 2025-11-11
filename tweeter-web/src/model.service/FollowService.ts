import { AuthToken, User } from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "./network/ServerFacade";

export class FollowService extends Service {
  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    let pagedUserItemRequest = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    };
    return await this.serverFacade.getMoreFollowees(pagedUserItemRequest);
  }

  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    let pagedUserItemRequest = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    };
    return await this.serverFacade.getMoreFollowers(pagedUserItemRequest);
  }

  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    let getIsFollowerStatusRequest = {
      token: authToken.token,
      user: user.dto,
      selectedUser: selectedUser.dto,
    };
    return await this.serverFacade.getIsFollowerStatus(
      getIsFollowerStatusRequest
    );
  }

  public async getFolloweeCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    let getFolloweeCountRequest = {
      token: authToken.token,
      user: user.dto,
    };
    return await this.serverFacade.getFolloweeCount(getFolloweeCountRequest);
  }

  public async getFollowerCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    let getFollowerCountRequest = {
      token: authToken.token,
      user: user.dto,
    };
    return await this.serverFacade.getFollowerCount(getFollowerCountRequest);
  }

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    let followRequest = {
      token: authToken.token,
      userToFollow: userToFollow.dto,
    };
    return await this.serverFacade.follow(followRequest);
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    let unfollowRequest = {
      token: authToken.token,
      userToUnfollow: userToUnfollow.dto,
    };
    return await this.serverFacade.unfollow(unfollowRequest);
  }
}
