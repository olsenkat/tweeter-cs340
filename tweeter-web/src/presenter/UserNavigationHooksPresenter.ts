import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { NavPresenter, NavView } from "./NavPresenter";

export interface UserNavigationHooksView extends NavView{
  setDisplayedUser: (user: User) => void;
}

export class UserNavigationHooksPresenter extends NavPresenter<UserNavigationHooksView> {
  public async navigateToUser(
    event: React.MouseEvent,
    authToken: AuthToken | null,
    displayedUser: User | null,
    featurePath: string
  ): Promise<void> {
    await this.doFailureReportingOperation(async () => {
      const alias = this.extractAlias(event.target.toString());
      const toUser = await this.service.getUser(authToken!, alias);
      
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
