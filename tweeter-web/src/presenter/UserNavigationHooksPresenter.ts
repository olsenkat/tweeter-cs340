import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { NavView, Presenter } from "./Presenter";
// import { NavPresenter, NavView } from "./NavPresenter";

export interface UserNavigationHooksView extends NavView {
  setDisplayedUser: (user: User) => void;
}

export class UserNavigationHooksPresenter extends Presenter<UserNavigationHooksView> {
  private _service: UserService;

  public constructor(view: UserNavigationHooksView) {
    super(view);
    this._service = new UserService();
  }

  public async navigateToUser(
    event: React.MouseEvent,
    authToken: AuthToken | null,
    displayedUser: User | null,
    featurePath: string
  ): Promise<void> {
    await this.doFailureReportingOperation(async () => {
      const alias = this.extractAlias(event.target.toString());
      const toUser = await this._service.getUser(authToken!, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser!)) {
          this.view.setDisplayedUser(toUser);
          this.view.navigate(`${featurePath}/${toUser.alias}`);
        }
      }
    }, "get user");
  }

  protected extractAlias = (value: string): string => {
    const index = value.indexOf("@");
    return value.substring(index);
  };
}
