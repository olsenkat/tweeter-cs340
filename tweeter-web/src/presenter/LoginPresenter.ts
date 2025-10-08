// import { useState } from "react";
import { AuthenticationService } from "../model.service/AuthenticationService";
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
  private service: AuthenticationService;

  public constructor(view: AuthenticationView) {
    super(view);
    this.service = new AuthenticationService();
  }

  // Do Login
  public async doAuth({
    alias,
    password,
    rememberMe,
    originalUrl,
  }: LoginParams) {
    try {
      this.view.setIsLoading(true);

      const [user, authToken] = await this.service.login(alias, password);

      this.view.updateUserInfo(user, user, authToken, rememberMe);

      if (!!originalUrl) {
        this.view.navigate(originalUrl);
      } else {
        this.view.navigate(`/feed/${user.alias}`);
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to log user in because of exception: ${error}`
      );
    } finally {
      this.view.setIsLoading(false);
    }
  }
}
