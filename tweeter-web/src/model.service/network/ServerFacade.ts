import {
  AuthToken,
  CreateUserRequest,
  CreateUserResponse,
  FollowRequest,
  FollowResponse,
  GetFolloweeCountRequest,
  GetFolloweeCountResponse,
  GetFollowerCountRequest,
  GetFollowerCountResponse,
  GetIsFollowerStatusRequest,
  GetIsFollowerStatusResponse,
  GetUserRequest,
  GetUserResponse,
  LoginUserRequest,
  LoginUserResponse,
  LogoutUserRequest,
  LogoutUserResponse,
  PagedUserItemRequest,
  PagedUserItemResponse,
  PostStatusRequest,
  PostStatusResponse,
  Status,
  StatusDto,
  TweeterRequest,
  TweeterResponse,
  UnfollowRequest,
  UnfollowResponse,
  User,
  UserDto,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";

export class ServerFacade {
  private SERVER_URL =
    "https://vr9pl74occ.execute-api.us-west-2.amazonaws.com/dev";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  ////////////////////////////////////////////////////////////////////////////
  //                          Helper Methods
  ////////////////////////////////////////////////////////////////////////////

  private async getData<T extends TweeterRequest, U extends TweeterResponse>(
    request: T,
    path: string,
    operation: (response: U) => U
  ): Promise<U> {
    const response = await this.clientCommunicator.doPost<T, U>(request, path);

    if (response.success) {
      return operation(response);
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  private getItems<U, V>(
    response: PagedUserItemResponse<V>,
    ItemClass: { fromDto(dto: V): U | null },
    itemString: string
  ): [U[], boolean] {
    if (!response.success || !response.items) {
      throw new Error(`No ${itemString} found`);
    }

    const items = response.items
      .map((dto) => ItemClass.fromDto(dto))
      .filter((item): item is U => item !== null);
    return [items, response.hasMore];
  }

  private convertUserDto(userDto: UserDto | null | undefined): User | null {
    if (!userDto) {
      return null;
    }
    return User.fromDto(userDto) as User;
  }

  private convertAuthTokenDto(authTokenDto: any): AuthToken | null {
    if (!authTokenDto) {
      return null;
    }
    return AuthToken.fromDto(authTokenDto) as AuthToken;
  }

  private checkUserAuthNotNull(user: User | null, authToken: AuthToken | null) {
    if (user == null) {
      throw new Error(`User not found`);
    } else if (authToken == null) {
      throw new Error(`AuthToken not found`);
    }
  }

  ////////////////////////////////////////////////////////////////////////////
  //                          Follow Methods
  ////////////////////////////////////////////////////////////////////////////

  public async getIsFollowerStatus(
    request: GetIsFollowerStatusRequest
  ): Promise<boolean> {
    let response: GetIsFollowerStatusResponse = await this.getData<
      GetIsFollowerStatusRequest,
      GetIsFollowerStatusResponse
    >(
      request,
      "/follow/isfollower",
      (response: GetIsFollowerStatusResponse) => {
        return response;
      }
    );
    return response.isFollower;
  }

  public async follow(
    request: FollowRequest
  ): Promise<[followerCount: number, followeeCount: number]> {
    const response: FollowResponse = await this.getData<
      FollowRequest,
      FollowResponse
    >(request, "/follow/follow", (response: FollowResponse) => {
      return response;
    });
    return [response.followerCount, response.followeeCount];
  }

  public async unfollow(
    request: UnfollowRequest
  ): Promise<[followerCount: number, followeeCount: number]> {
    const response: UnfollowResponse = await this.getData<
      UnfollowRequest,
      UnfollowResponse
    >(request, "/follow/unfollow", (response: UnfollowResponse) => {
      return response;
    });
    return [response.followerCount, response.followeeCount];
  }

  public async getFolloweeCount(
    request: GetFolloweeCountRequest
  ): Promise<number> {
    const response: GetFolloweeCountResponse = await this.getData<
      GetFolloweeCountRequest,
      GetFolloweeCountResponse
    >(request, "/followee/count", (response: GetFolloweeCountResponse) => {
      return response;
    });
    return response.followeeCount;
  }

  public async getFollowerCount(
    request: GetFollowerCountRequest
  ): Promise<number> {
    const response: GetFollowerCountResponse = await this.getData<
      GetFollowerCountRequest,
      GetFollowerCountResponse
    >(request, "/follower/count", (response: GetFollowerCountResponse) => {
      return response;
    });
    return response.followerCount;
  }

  public async getMoreFollowees(
    request: PagedUserItemRequest<UserDto>
  ): Promise<[User[], boolean]> {
    const response: PagedUserItemResponse<UserDto> = await this.getData<
      PagedUserItemRequest<UserDto>,
      PagedUserItemResponse<UserDto>
    >(request, "/followee/list", (response: PagedUserItemResponse<UserDto>) => {
      return response;
    });
    return this.getItems<User, UserDto>(response, User, "followees");
  }

  public async getMoreFollowers(
    request: PagedUserItemRequest<UserDto>
  ): Promise<[User[], boolean]> {
    const response: PagedUserItemResponse<UserDto> = await this.getData<
      PagedUserItemRequest<UserDto>,
      PagedUserItemResponse<UserDto>
    >(request, "/follower/list", (response: PagedUserItemResponse<UserDto>) => {
      return response;
    });
    return this.getItems<User, UserDto>(response, User, "followers");
  }

  ////////////////////////////////////////////////////////////////////////////
  //                          Status Methods
  ////////////////////////////////////////////////////////////////////////////

  public async loadMoreFeedItems(
    request: PagedUserItemRequest<StatusDto>
  ): Promise<[Status[], boolean]> {
    const response: PagedUserItemResponse<StatusDto> = await this.getData<
      PagedUserItemRequest<StatusDto>,
      PagedUserItemResponse<StatusDto>
    >(request, "/feed/list", (response: PagedUserItemResponse<StatusDto>) => {
      return response;
    });
    return this.getItems<Status, StatusDto>(response, Status, "feed items");
  }

  public async loadMoreStoryItems(
    request: PagedUserItemRequest<StatusDto>
  ): Promise<[Status[], boolean]> {
    const response: PagedUserItemResponse<StatusDto> = await this.getData<
      PagedUserItemRequest<StatusDto>,
      PagedUserItemResponse<StatusDto>
    >(request, "/story/list", (response: PagedUserItemResponse<StatusDto>) => {
      return response;
    });
    return this.getItems<Status, StatusDto>(response, Status, "story items");
  }

  public async postStatus(request: PostStatusRequest): Promise<void> {
    await this.getData<PostStatusRequest, PostStatusResponse>(
      request,
      "/status/post",
      (response: PostStatusResponse) => {
        return response;
      }
    );
    return;
  }

  ////////////////////////////////////////////////////////////////////////////
  //                          User Methods
  ////////////////////////////////////////////////////////////////////////////

  public async getUser(request: GetUserRequest): Promise<User | null> {
    const response: GetUserResponse = await this.getData<
      GetUserRequest,
      GetUserResponse
    >(request, "/user/get", (response: GetUserResponse) => {
      return response;
    });

    return this.convertUserDto(response.userDto);
  }

  public async loginUser(
    request: LoginUserRequest
  ): Promise<[User, AuthToken]> {
    const response: LoginUserResponse = await this.getData<
      LoginUserRequest,
      LoginUserResponse
    >(request, "/user/login", (response: LoginUserResponse) => {
      return response;
    });

    const user = this.convertUserDto(response.userDto);
    const authToken = this.convertAuthTokenDto(response.authTokenDto);
    this.checkUserAuthNotNull(user, authToken);

    return [user as User, authToken as AuthToken];
  }

  public async createUser(
    request: CreateUserRequest
  ): Promise<[User, AuthToken]> {
    const response: CreateUserResponse = await this.getData<
      CreateUserRequest,
      CreateUserResponse
    >(request, "/user/create", (response: CreateUserResponse) => {
      return response;
    });

    const user = this.convertUserDto(response.userDto);
    const authToken = this.convertAuthTokenDto(response.authTokenDto);
    this.checkUserAuthNotNull(user, authToken);

    return [user as User, authToken as AuthToken];
  }

  public async logoutUser(request: LogoutUserRequest): Promise<void> {
    await this.getData<LogoutUserRequest, LogoutUserResponse>(
      request,
      "/user/logout",
      (response: LogoutUserResponse) => {
        return response;
      }
    );
    return;
  }
}