import { AuthToken, User, FakeData, UserDto, AuthTokenDto } from "tweeter-shared";
import { Buffer } from "buffer";

export class UserService {
  public async getUser(
    token: string,
    alias: string
  ): Promise<UserDto | null> {
    let user = FakeData.instance.findUserByAlias(alias);
    return user ? user.dto : null;
  }

  public async loginUser(
    alias: string,
    password: string
  ): Promise<[UserDto, AuthTokenDto]> {
    // TODO: Replace with database call
    const user = FakeData.instance.firstUser;

    if (user === null) {
      throw new Error("Invalid alias or password");
    }

    return [user.dto, FakeData.instance.authToken.dto];
  }
}
