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
  private service: UserService;

  public constructor(view: AuthenticationView) {
    super(view);
    this.service = new UserService();
  }

  // Do Login
  public async doAuth({
    alias,
    password,
    rememberMe,
    originalUrl,
  }: LoginParams) {
    await this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);

      const [user, authToken] = await this.service.login(alias, password);

      this.view.updateUserInfo(user, user, authToken, rememberMe);

      if (!!originalUrl) {
        this.view.navigate(originalUrl);
      } else {
        this.view.navigate(`/feed/${user.alias}`);
      }
    }, "log user in");
    this.view.setIsLoading(false);
  }
}
