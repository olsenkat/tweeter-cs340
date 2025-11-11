import { AuthToken, User, FakeData, UserDto } from "tweeter-shared";

export class FollowService {
  public async loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    // TODO: Replace with calling database
    return this.getFakeData(lastItem, pageSize, userAlias);
  }

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    // TODO: Replace with calling database
    return this.getFakeData(lastItem, pageSize, userAlias);
  }

  private async getFakeData(lastItem: UserDto | null, pageSize: number, userAlias: string): Promise<[UserDto[], boolean]> {
    const [items, hasMore] = FakeData.instance.getPageOfUsers(User.fromDto(lastItem), pageSize, userAlias);
    const dtos = items.map((user) => user.dto);
    return [dtos, hasMore];
  }

  public async getIsFollowerStatus(
    token: string,
    user: UserDto,
    selectedUser: UserDto
  ): Promise<boolean> {
    // TODO: Replace with calling database
    return FakeData.instance.isFollower();
  }

  public async getFolloweeCount(
    token: string,
    user: UserDto
  ): Promise<number> {
    // TODO: Replace with calling database
    return FakeData.instance.getFolloweeCount(user.alias);
  }
}