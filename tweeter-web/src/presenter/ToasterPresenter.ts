import { Toast } from "../components/toaster/Toast";

export interface ToasterView {
  deleteMessage: (messageId: string) => void;
}

export class ToasterPresenter {
  private _view: ToasterView;

  public constructor(view: ToasterView) {
    this._view = view;
  }

  public deleteExpiredToasts(messageList: Toast[]) {
    const now = Date.now();

    for (let toast of messageList) {
      if (
        toast.expirationMillisecond > 0 &&
        toast.expirationMillisecond < now
      ) {
        this._view.deleteMessage(toast.id);
      }
    }
  }
}
