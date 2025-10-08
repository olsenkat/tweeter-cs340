import { User, AuthToken } from "tweeter-shared";

export interface AuthenticationView {
  checkSubmitButtonStatus: () => boolean;
  setIsLoading: (isLoading: boolean) => void;
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  navigate: (url: string) => void;
  displayErrorMessage: (message: string) => void;
}

export abstract class AuthenticationPresenter<
  TParams,
  TView extends AuthenticationView
> {
  private _view: TView;

  protected constructor(view: TView) {
    this._view = view;
  }

  protected get view() {
    return this._view;
  }

  public abstract doAuth(params: TParams): void;
}
