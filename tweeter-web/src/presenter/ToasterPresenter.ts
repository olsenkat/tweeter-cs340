import { Toast } from "../components/toaster/Toast";
import { Presenter, MessageView } from "./Presenter";

export interface ToasterView extends MessageView {
  // No additional methods needed for now
}

export class ToasterPresenter extends Presenter<ToasterView> {
  public constructor(view: ToasterView) {
    super(view);
  }

  public deleteExpiredToasts(messageList: Toast[]) {
    const now = Date.now();

    for (let toast of messageList) {
      if (
        toast.expirationMillisecond > 0 &&
        toast.expirationMillisecond < now
      ) {
        this.view.deleteMessage(toast.id);
      }
    }
  }
}
