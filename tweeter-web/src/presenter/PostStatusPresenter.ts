import { AuthToken, User, Status } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";


export interface PostStatusView {
  displayInfoMessage: (message: string, duration: number, bootstrapClasses?: string | undefined) => string,
  displayErrorMessage: (message: string, bootstrapClasses?: string | undefined) => string,
  deleteMessage: (messageId: string) => void,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setPost: React.Dispatch<React.SetStateAction<string>>
}

export class PostStatusPresenter {
  private view: PostStatusView;
  private service: StatusService;

  public constructor(view: PostStatusView) {
    this.view = view;
    this.service = new StatusService()
  }

  public async submitPost (event: React.MouseEvent, post: string, currentUser: User | null, authToken: AuthToken) {
    event.preventDefault();

    var postingStatusToastId = "";

    try {
      this.view.setIsLoading(true);
      postingStatusToastId = this.view.displayInfoMessage("Posting status...", 0);

      const status = new Status(post, currentUser!, Date.now());

      await this.service.postStatus(authToken!, status);

      this.view.setPost("");
      this.view.displayInfoMessage("Status posted!", 2000);
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to post the status because of exception: ${error}`
      );
    } finally {
      this.view.deleteMessage(postingStatusToastId);
      this.view.setIsLoading(false);
    }
  };

  public clearPost (event: React.MouseEvent) {
    event.preventDefault();
    this.view.setPost("");
  };

  public checkButtonStatus(post: string, authToken: AuthToken, currentUser: User): boolean {
    return !post.trim() || !authToken || !currentUser;
  };
}