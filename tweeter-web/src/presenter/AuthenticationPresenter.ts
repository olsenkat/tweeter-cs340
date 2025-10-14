import { User, AuthToken } from "tweeter-shared";
import { Presenter, View } from "./Presenter";
import { UserService } from "../model.service/UserService";

export interface AuthenticationView extends View {
  checkSubmitButtonStatus: () => boolean;
  setIsLoading: (isLoading: boolean) => void;
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  navigate: (url: string) => void;
}

export abstract class AuthenticationPresenter<
  TParams extends AuthParams,
  TView extends AuthenticationView
> extends Presenter<TView> {

  private _service: UserService;

  public constructor(view: TView) {
    super(view);
    this._service = new UserService();
  }

  protected get service() {
    return this._service;
  }

  // public abstract doAuth(params: TParams): void;
  public async doAuth(params: TParams, authString: string): Promise<void> {
    await this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);

      // const [user, authToken] = await this.service.login(params.alias, params.password);
      const [user, authToken] = await this.authenticate(params);

      this.view.updateUserInfo(user, user, authToken, params.rememberMe);

      if (this.navigateOK(params)) {
        this.view.navigate(`/feed/${user.alias}`);
      }
    }, authString);
    this.view.setIsLoading(false);
  }

  protected abstract navigateOK(params: TParams): boolean;
  protected abstract authenticate(params: TParams): Promise<[User, AuthToken]>;
}
