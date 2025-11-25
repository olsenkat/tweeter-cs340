import {
  AuthToken,
  User,
  UserDto,
  AuthTokenDto,
} from "tweeter-shared";
import { Service } from "./Service";
import { UserRecord } from "../entities/UserRecord";
import bcrypt from "bcryptjs";
import { AuthService } from "./AuthService";
import { DaoFactory } from "../factory/DaoFactory";
import { BadRequestError } from "../errors/Error";

export class UserService extends Service {
  private authService: AuthService;
  
  constructor (daoFactory: DaoFactory, authService: AuthService) {
    super(daoFactory);
    this.authService = authService;
  }
  
  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    await this.authService.validateToken(token);
    return this.getStoredUser(alias);
  }

  public async loginUser(
    alias: string,
    password: string
  ): Promise<[UserDto, AuthTokenDto]> {
    const userRecord = await this.daoFactory.getUserDao().getUser(alias);
    if (!userRecord) {
      throw new BadRequestError("User not found");
    }
    const validPassword = await bcrypt.compare(password, userRecord.passwordHash);
    if (!validPassword) {
      throw new BadRequestError("Password Incorrect");
    }

    const user = await this.getUserDtoFromRecord(userRecord);
    const authToken: AuthTokenDto = await this.createAuthToken(alias);
    return [user, authToken];
  }

  public async registerUser(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageStringBase64: string,
    imageFileExtension: string
  ): Promise<[UserDto, AuthTokenDto]> {
    // const userImageBytes: Uint8Array = Uint8Array.from(Buffer.from(imageStringBase64, "base64"));

    const hashedPassword = await bcrypt.hash(password, 10);

    const imageKey = await this.daoFactory
      .getS3Dao()
      .uploadImage(alias, imageStringBase64, imageFileExtension);
    
    const userRecord = {
      firstName: firstName,
      alias: alias,
      lastName: lastName,
      passwordHash: hashedPassword,
      imageKey: imageKey,
    } as UserRecord;

    await this.daoFactory.getUserDao().insertUser(userRecord);
    const authToken: AuthTokenDto = await this.createAuthToken(alias);

    const user: UserDto = await this.getUserDtoFromRecord(userRecord);

    return [user, authToken];
  }

  public async logoutUser(token: string): Promise<void> {

    await this.authService.validateToken(token);
    await this.authService.deleteToken(token);
  }

  ///////////////////////////////////////
  //            Helper Functions
  ///////////////////////////////////////

  private async getStoredUser(alias: string): Promise<UserDto | null> {
    const userRecord = await this.daoFactory.getUserDao().getUser(alias);
    if (!userRecord) {
      return null;
    }

    return this.getUserDtoFromRecord(userRecord);
  }

  private async getUserDtoFromRecord(userRecord: UserRecord): Promise<UserDto> {
    const imageUrl = await this.daoFactory
      .getS3Dao()
      .getImageUrl(userRecord.imageKey);

    return {
      firstName: userRecord.firstName,
      lastName: userRecord.lastName,
      alias: userRecord.alias,
      imageUrl: imageUrl
    } as UserDto
  }

  private async createAuthToken(alias: string): Promise<AuthTokenDto> {
    const authToken = AuthToken.Generate();
    await this.daoFactory
      .getAuthDao()
      .createAuthToken(alias, authToken.token, authToken.timestamp);

    return authToken.dto;
  }
}
