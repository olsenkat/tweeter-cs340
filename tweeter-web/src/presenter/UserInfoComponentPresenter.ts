import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";
import { MessageView, Presenter } from "./Presenter";

export interface UserInfoComponentView extends MessageView {
  setIsFollower: React.Dispatch<React.SetStateAction<boolean>>;
  setFolloweeCount: React.Dispatch<React.SetStateAction<number>>;
  setFollowerCount: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export class UserInfoComponentPresenter extends Presenter<UserInfoComponentView> {
  private _followService: FollowService;

  public constructor(view: UserInfoComponentView) {
    super(view);
    this._followService = new FollowService();
  }

  public async initUserInfo(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    this.setIsFollowerStatus(authToken!, currentUser!, displayedUser!);
    this.setNumbFollowees(authToken!, displayedUser!);
    this.setNumbFollowers(authToken!, displayedUser!);
  }

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    await this.doFailureReportingOperation(async () => {
      if (currentUser === displayedUser) {
        this.view.setIsFollower(false);
      } else {
        this.view.setIsFollower(
          await this._followService.getIsFollowerStatus(
            authToken!,
            currentUser!,
            displayedUser!
          )
        );
      }
    }, "determine follower status");
  }

  public async setNumbFollowees(authToken: AuthToken, displayedUser: User) {
    await this.doFailureReportingOperation(async () => {
      this.view.setFolloweeCount(
        await this._followService.getFolloweeCount(authToken, displayedUser)
      );
    }, "get followees count");
  }

  public async setNumbFollowers(authToken: AuthToken, displayedUser: User) {
    await this.doFailureReportingOperation(async () => {
      this.view.setFollowerCount(
        await this._followService.getFollowerCount(authToken, displayedUser)
      );
    }, "get followers count");
  }

  public async changeUserFollowStatus(
    authToken: AuthToken,
    displayedUser: User | null,
    messageAction: string,
    followerBool: boolean,
    serviceCall: (
      authToken: AuthToken,
      userToFollow: User
    ) => Promise<[followerCount: number, followeeCount: number]>,
    followDisplay: string
  ): Promise<void> {
    var userToast = "";

    await this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);
      userToast = this.view.displayInfoMessage(
        `${messageAction} ${displayedUser!.name}...`,
        0
      );

      const [followerCount, followeeCount] = await serviceCall(
        authToken!,
        displayedUser!
      );

      this.view.setIsFollower(followerBool);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
    }, followDisplay);
    this.view.deleteMessage(userToast);
    this.view.setIsLoading(false);
  }

  public async followDisplayedUser(
    authToken: AuthToken,
    displayedUser: User | null
  ): Promise<void> {
    this.changeUserFollowStatus(
      authToken,
      displayedUser,
      "Following",
      true,
      this._followService.follow.bind(this._followService),
      "follow user"
    );
  }

  public async unfollowDisplayedUser(
    authToken: AuthToken,
    displayedUser: User | null
  ): Promise<void> {
    this.changeUserFollowStatus(
      authToken,
      displayedUser,
      "Unfollowing",
      false,
      this._followService.unfollow.bind(this._followService),
      "unfollow user"
    );
  }
}
