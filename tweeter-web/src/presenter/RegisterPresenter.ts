import { Buffer } from "buffer";
import { UserService } from "../model.service/UserService";
import {
  AuthenticationPresenter,
  AuthenticationView,
} from "./AuthenticationPresenter";
import { AuthToken, User } from "tweeter-shared";

export interface RegisterView extends AuthenticationView {
  setImageBytes: React.Dispatch<React.SetStateAction<Uint8Array>>;
  setImageFileExtension: React.Dispatch<React.SetStateAction<string>>;
  setImageUrl: React.Dispatch<React.SetStateAction<string>>;
}

export class RegisterPresenter extends AuthenticationPresenter<
  RegisterParams,
  RegisterView
> {

  // public async doAuth<RegisterParams>({
  //   params: RegisterParams) {
  //   await this.doFailureReportingOperation(async () => {
  //     this.view.setIsLoading(true);

  //     const [user, authToken] = await this.service.register(
  //       firstName,
  //       lastName,
  //       alias,
  //       password,
  //       imageBytes,
  //       imageFileExtension
  //     );

  //     this.view.updateUserInfo(user, user, authToken, rememberMe);
  //     this.view.navigate(`/feed/${user.alias}`);
  //   }, "register user");

  //   this.view.setIsLoading(false);
  // }

  protected navigateOK(params: RegisterParams): boolean {
    return true;
  }

  protected async authenticate(params: RegisterParams): Promise<[User, AuthToken]> {
    return this.service.register(
        params.firstName,
        params.lastName,
        params.alias,
        params.password,
        params.imageBytes,
        params.imageFileExtension
      );
  }

  public handleImageFile = (file: File | undefined) => {
    if (file) {
      this.view.setImageUrl(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const imageStringBase64 = event.target?.result as string;

        // Remove unnecessary file metadata from the start of the string.
        const imageStringBase64BufferContents =
          imageStringBase64.split("base64,")[1];

        const bytes: Uint8Array = Buffer.from(
          imageStringBase64BufferContents,
          "base64"
        );

        this.view.setImageBytes(bytes);
      };
      reader.readAsDataURL(file);

      // Set image file extension (and move to a separate method)
      const fileExtension = this.getFileExtension(file);
      if (fileExtension) {
        this.view.setImageFileExtension(fileExtension);
      }
    } else {
      this.view.setImageUrl("");
      this.view.setImageBytes(new Uint8Array());
    }
  };

  private getFileExtension = (file: File): string | undefined => {
    return file.name.split(".").pop();
  };
}
