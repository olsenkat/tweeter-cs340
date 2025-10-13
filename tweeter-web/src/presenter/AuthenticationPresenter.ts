import { User, AuthToken } from "tweeter-shared";
import { Presenter, View } from "./Presenter";

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
  TParams,
  TView extends AuthenticationView
> extends Presenter<TView> {
  protected constructor(view: TView) {
    super(view);
  }

  public abstract doAuth(params: TParams): void;
}
