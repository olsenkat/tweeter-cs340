import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";

export interface NavView extends View {
  navigate: (url: string) => void;
}

export class NavPresenter<T extends NavView> extends Presenter<T> {
  private _service: UserService;

  public constructor(view: T) {
    super(view);
    this._service = new UserService();
  }

  protected get service() {
    return this._service;
  }
}