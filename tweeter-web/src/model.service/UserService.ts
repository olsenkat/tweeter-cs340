import { AuthToken, User } from "tweeter-shared";
import { Buffer } from "buffer";
import { Service } from "./Service";

export class UserService extends Service {
  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    let getUserRequest = {
      token: authToken.token,
      alias: alias
    };
    return await this.serverFacade.getUser(getUserRequest);
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[User, AuthToken]> {
    let loginUserRequest = {
      alias: alias,
      password: password
    };
    return await this.serverFacade.loginUser(loginUserRequest);;
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    const imageStringBase64: string =
        Buffer.from(userImageBytes).toString("base64");

    let createUserRequest = {
      firstName: firstName,
      lastName: lastName,
      alias: alias,
      password: password,
      imageStringBase64: imageStringBase64,
      imageFileExtension: imageFileExtension
    };
    return await this.serverFacade.createUser(createUserRequest);
  }

  public async logout (authToken: AuthToken): Promise<void> {
    let logoutUserRequest = {
      token: authToken.token
    };
    return await this.serverFacade.logoutUser(logoutUserRequest);
  };
}
