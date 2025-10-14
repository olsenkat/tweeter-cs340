import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import {
  AuthenticationPresenter,
  AuthenticationView,
} from "./AuthenticationPresenter";

export interface LoginView extends AuthenticationView {
  // Nothing added
}

export class LoginPresenter extends AuthenticationPresenter<
  LoginParams,
  LoginView
> {
  // Do Login
  // public async doAuth<LoginParams>(params: LoginParams) {
  //   await this.doFailureReportingOperation(async () => {
  //     this.view.setIsLoading(true);

  //     const [user, authToken] = await this.service.login(params.alias, params.password);

  //     this.view.updateUserInfo(user, user, authToken, params.rememberMe);

  //     if (!!originalUrl) {
  //       this.view.navigate(originalUrl);
  //     } else {
  //       this.view.navigate(`/feed/${user.alias}`);
  //     }
  //   }, "log user in");
  //   this.view.setIsLoading(false);
  // }

  protected navigateOK(params: LoginParams): boolean {
    if (!!params.originalUrl) {
        this.view.navigate(params.originalUrl);
      } else {
        return true;
      }
      return false;
  }

  protected async authenticate(params: LoginParams): Promise<[User, AuthToken]> {
    return this.service.login(params.alias, params.password);
  }
}
