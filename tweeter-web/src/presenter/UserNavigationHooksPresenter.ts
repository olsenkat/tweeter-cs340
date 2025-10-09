import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface UserNavigationHooksView {
  displayErrorMessage: (message: string) => void;
  setDisplayedUser: (user: User) => void;
  navigate: (path: string) => void;
}

export class UserNavigationHooksPresenter {
  private _view: UserNavigationHooksView;
  private _service: UserService;

  public constructor(view: UserNavigationHooksView) {
    this._view = view;
    this._service = new UserService();
  }

  public async navigateToUser(
    event: React.MouseEvent,
    authToken: AuthToken | null,
    displayedUser: User | null,
    featurePath: string
  ): Promise<void> {
    try {
      const alias = this.extractAlias(event.target.toString());

      const toUser = await this._service.getUser(authToken!, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser!)) {
          this._view.setDisplayedUser(toUser);
          this._view.navigate(`${featurePath}/${toUser.alias}`);
        }
      }
    } catch (error) {
      this._view.displayErrorMessage(
        `Failed to get user because of exception: ${error}`
      );
    }
  }

  protected extractAlias = (value: string): string => {
    const index = value.indexOf("@");
    return value.substring(index);
  };
}
