import {
  GetUserRequest,
  GetUserResponse,
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
}