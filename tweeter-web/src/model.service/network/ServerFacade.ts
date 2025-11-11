import {
  AuthToken,
  CreateUserRequest,
  CreateUserResponse,
  GetFolloweeCountRequest,
  GetFolloweeCountResponse,
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
  User,
  UserDto,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";

export class ServerFacade {
  private SERVER_URL = "https://vr9pl74occ.execute-api.us-west-2.amazonaws.com/dev";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  public async getIsFollowerStatus(
    request: GetIsFollowerStatusRequest
  ): Promise<boolean> {
    const response = await this.clientCommunicator.doPost<
      GetIsFollowerStatusRequest,
      GetIsFollowerStatusResponse
    >(request, "/follow/isfollower");

    // Handle errors    
    if (response.success) {
      return response.isFollower;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getFolloweeCount(
    request: GetFolloweeCountRequest
  ): Promise<number> {
    const response = await this.clientCommunicator.doPost<
      GetFolloweeCountRequest,
      GetFolloweeCountResponse
    >(request, "/followee/count");

    // Handle errors    
    if (response.success) {
      return response.followeeCount;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getMoreFollowees(
    request: PagedUserItemRequest<UserDto>
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest<UserDto>,
      PagedUserItemResponse<UserDto>
    >(request, "/followee/list");

    // Convert the UserDto array returned by ClientCommunicator to a User array
    const items: User[] | null =
      response.success && response.items
        ? response.items.map((dto) => User.fromDto(dto) as User)
        : null;

    // Handle errors    
    if (response.success) {
      if (items == null) {
        throw new Error(`No followees found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getMoreFollowers(
    request: PagedUserItemRequest<UserDto>
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest<UserDto>,
      PagedUserItemResponse<UserDto>
    >(request, "/follower/list");

    // Convert the UserDto array returned by ClientCommunicator to a User array
    const items: User[] | null =
      response.success && response.items
        ? response.items.map((dto) => User.fromDto(dto) as User)
        : null;

    // Handle errors    
    if (response.success) {
      if (items == null) {
        throw new Error(`No followers found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async loadMoreFeedItems(
    request: PagedUserItemRequest<StatusDto>
  ): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest<StatusDto>,
      PagedUserItemResponse<StatusDto>
    >(request, "/feed/list");

    // Convert the StatusDto array returned by ClientCommunicator to a Status array
    const items: Status[] | null =
      response.success && response.items
        ? response.items.map((dto) => Status.fromDto(dto) as Status)
        : null;

    // Handle errors    
    if (response.success) {
      if (items == null) {
        throw new Error(`No feed items found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async loadMoreStoryItems(
    request: PagedUserItemRequest<StatusDto>
  ): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest<StatusDto>,
      PagedUserItemResponse<StatusDto>
    >(request, "/story/list");

    // Convert the StatusDto array returned by ClientCommunicator to a Status array
    const items: Status[] | null =
      response.success && response.items
        ? response.items.map((dto) => Status.fromDto(dto) as Status)
        : null;

    // Handle errors    
    if (response.success) {
      if (items == null) {
        throw new Error(`No story items found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async postStatus(
    request: PostStatusRequest
  ): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      PostStatusRequest,
      PostStatusResponse
    >(request, "/status/post");

    // Handle errors    
    if (response.success) {
      // Successfully posted status
      return;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getUser(
    request: GetUserRequest
  ): Promise<User | null> {
    const response = await this.clientCommunicator.doPost<
      GetUserRequest,
      GetUserResponse
    >(request, "/user/get");

    // Convert the UserDto returned by ClientCommunicator to a User
    const user = response.success && response.userDto
      ? User.fromDto(response.userDto) as User
      : null;

    // Handle errors    
    if (response.success) {
      return user;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async loginUser(
    request: LoginUserRequest
  ): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      LoginUserRequest,
      LoginUserResponse
    >(request, "/user/login");

    // Convert the UserDto returned by ClientCommunicator to a User
    const user = response.success && response.userDto
      ? User.fromDto(response.userDto) as User
      : null;

    const authToken = response.success && response.authTokenDto
      ? AuthToken.fromDto(response.authTokenDto) as AuthToken
      : null;

    // Handle errors    
    if (response.success) {
      if (user == null) {
        throw new Error(`User not found`);
      }
      else if (authToken == null) {
        throw new Error(`AuthToken not found`);
      }
      else {
        return [user, authToken];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async createUser(
    request: CreateUserRequest
  ): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      CreateUserRequest,
      CreateUserResponse
    >(request, "/user/create");

    // Convert the UserDto returned by ClientCommunicator to a User
    const user = response.success && response.userDto
      ? User.fromDto(response.userDto) as User
      : null;

    const authToken = response.success && response.authTokenDto
      ? AuthToken.fromDto(response.authTokenDto) as AuthToken
      : null;

    // Handle errors    
    if (response.success) {
      if (user == null) {
        throw new Error(`User not created`);
      }
      else if (authToken == null) {
        throw new Error(`AuthToken not created`);
      }
      else {
        return [user, authToken];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async logoutUser(
    request: LogoutUserRequest
  ): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      LogoutUserRequest,
      LogoutUserResponse
    >(request, "/user/logout");

    // Handle errors    
    if (response.success) {
      return;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }
}