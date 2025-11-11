import { AuthToken, User, FakeData, UserDto, AuthTokenDto } from "tweeter-shared";
import { Buffer } from "buffer";

export class UserService {
  public async getUser(
    token: string,
    alias: string
  ): Promise<UserDto | null> {
    // TODO: Replace with database call
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

  public async registerUser(
      firstName: string,
      lastName: string,
      alias: string,
      password: string,
      imageStringBase64: string,
      imageFileExtension: string
    ): Promise<[UserDto, AuthTokenDto]> {
      const userImageBytes: Uint8Array = Uint8Array.from(Buffer.from(imageStringBase64, "base64"));
  
      // TODO: Replace with registration logic
      const user = FakeData.instance.firstUser;
  
      if (user === null) {
        throw new Error("Invalid registration");
      }
  
      return [user.dto, FakeData.instance.authToken.dto];
    }
}
