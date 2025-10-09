import { AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface AppNavbarView {
  displayInfoMessage: (
    message: string,
    duration: number,
    bootstrapClasses?: string | undefined
  ) => string;
  deleteMessage: (messageId: string) => void;
  clearUserInfo: () => void;
  navigate: (url: string) => void;
  displayErrorMessage: (message: string) => void;
}

export class AppNavbarPresenter {
  private _view: AppNavbarView;
  private _service: UserService;

  public constructor(view: AppNavbarView) {
    this._view = view;
    this._service = new UserService();
  }

  public async logOut(authToken: AuthToken | null) {
    const loggingOutToastId = this._view.displayInfoMessage(
      "Logging Out...",
      0
    );

    try {
      await this._service.logout(authToken!);

      this._view.deleteMessage(loggingOutToastId);
      this._view.clearUserInfo();
      this._view.navigate("/login");
    } catch (error) {
      this._view.displayErrorMessage(
        `Failed to log user out because of exception: ${error}`
      );
    }
  }
}
