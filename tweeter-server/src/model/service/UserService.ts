import { AuthToken, User, FakeData, UserDto } from "tweeter-shared";
import { Buffer } from "buffer";

export class UserService {
  public async getUser(
    token: string,
    alias: string
  ): Promise<UserDto | null> {
    let user = FakeData.instance.findUserByAlias(alias);
    return user ? user.dto : null;
  }
}
