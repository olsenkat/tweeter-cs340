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

  public async followDisplayedUser(
    event: React.MouseEvent,
    authToken: AuthToken,
    displayedUser: User | null
  ): Promise<void> {
    var followingUserToast = "";

    await this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);
      followingUserToast = this.view.displayInfoMessage(
        `Following ${displayedUser!.name}...`,
        0
      );

      const [followerCount, followeeCount] = await this._followService.follow(
        authToken!,
        displayedUser!
      );

      this.view.setIsFollower(true);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
    }, "follow user");
    this.view.deleteMessage(followingUserToast);
    this.view.setIsLoading(false);
  }

  public async unfollowDisplayedUser(
    event: React.MouseEvent,
    authToken: AuthToken,
    displayedUser: User | null
  ): Promise<void> {
    var unfollowingUserToast = "";

    await this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);
      unfollowingUserToast = this.view.displayInfoMessage(
        `Unfollowing ${displayedUser!.name}...`,
        0
      );

      const [followerCount, followeeCount] = await this._followService.unfollow(
        authToken!,
        displayedUser!
      );

      this.view.setIsFollower(false);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
    }, "unfollow user");
    this.view.deleteMessage(unfollowingUserToast);
    this.view.setIsLoading(false);
  }
}
