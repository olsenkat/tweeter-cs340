import { AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { NavPresenter, NavView } from "./NavPresenter";
import { MessageView } from "./Presenter";

export interface AppNavbarView extends NavView, MessageView {
  clearUserInfo: () => void;
}

export class AppNavbarPresenter extends NavPresenter<AppNavbarView> {
  public async logOut(authToken: AuthToken | null) {
    const loggingOutToastId = this.view.displayInfoMessage("Logging Out...", 0);

    await this.doFailureReportingOperation(async () => {
      await this.service.logout(authToken!);
      this.view.deleteMessage(loggingOutToastId);
      this.view.clearUserInfo();
      this.view.navigate("/login");
    }, "log user out");
  }
}
