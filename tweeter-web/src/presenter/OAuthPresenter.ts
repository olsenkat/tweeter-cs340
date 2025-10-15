import { Presenter, MessageView } from "./Presenter";

export class OAuthPresenter extends Presenter<MessageView> {
  public constructor(view: MessageView) {
    super(view);
  }

  public displayInfoMessageWithDarkBackground = (message: string): void => {
    this.view.displayInfoMessage(message, 3000, "text-white bg-primary");
  };

  handleGoogleClick() {
    // TODO - Implement Service Call with this?
    this.displayInfoMessageWithDarkBackground(
      "Google registration is not implemented."
    );
  }

  handleFacebookClick() {
    // TODO - Implement Service call with this?
    this.displayInfoMessageWithDarkBackground(
      "Facebook registration is not implemented."
    );
  }

  handleTwitterClick() {
    // TODO - Implement Service call with this?
    this.displayInfoMessageWithDarkBackground(
      "Twitter registration is not implemented."
    );
  }

  handleLinkedInClick() {
    // TODO - Implement Service call with this?
    this.displayInfoMessageWithDarkBackground(
      "LinkedIn registration is not implemented."
    );
  }

  handleGithubClick() {
    // TODO - Implement Service call with this?
    this.displayInfoMessageWithDarkBackground(
      "Github registration is not implemented."
    );
  }
}
