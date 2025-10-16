import { AuthToken } from "tweeter-shared";
// import { NavPresenter, NavView } from "./NavPresenter";
import { MessageView, NavView, Presenter } from "./Presenter";
import { UserService } from "../model.service/UserService";

export interface AppNavbarView extends MessageView {
  clearUserInfo: () => void;
  navigateToLogin: () => void;
}

export class AppNavbarPresenter extends Presenter<AppNavbarView> {
  private _service: UserService;

  public constructor(view: AppNavbarView) {
    super(view);
    this._service = new UserService();
  }

  public get service() {
    return this._service;
  }

  public async logOut(authToken: AuthToken | null) {
    const loggingOutToastId = this.view.displayInfoMessage("Logging Out...", 0);

    await this.doFailureReportingOperation(async () => {
      await this.service.logout(authToken!);
      this.view.deleteMessage(loggingOutToastId);
      this.view.clearUserInfo();
      this.view.navigateToLogin();
    }, "log user out");
  }
}
