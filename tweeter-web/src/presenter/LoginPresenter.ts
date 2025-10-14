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
  protected navigateOK(params: LoginParams): boolean {
    if (!!params.originalUrl) {
      this.view.navigate(params.originalUrl);
    } else {
      return true;
    }
    return false;
  }

  protected async authenticate(
    params: LoginParams
  ): Promise<[User, AuthToken]> {
    return this.service.login(params.alias, params.password);
  }
}
