import { AuthToken } from "tweeter-shared";
import {
  AppNavbarPresenter,
  AppNavbarView,
} from "../../src/presenter/AppNavbarPresenter";
import {
  anything,
  capture,
  instance,
  mock,
  spy,
  verify,
  when,
} from "@typestrong/ts-mockito";
import { UserService } from "../../src/model.service/UserService";

describe.skip("AppNavbarPresenter", () => {
  let mockAppNavbarPresenterView: AppNavbarView;
  let appNavbarPresenter: AppNavbarPresenter;
  let mockService: UserService;

  const authToken = new AuthToken("test", Date.now()); // Will need to change for real data
  beforeEach(() => {
    // Use mock when we are stubbing - tell the mock what to do when it's methods are called.
    // Also use mock when we ar verifying
    mockAppNavbarPresenterView = mock<AppNavbarView>();

    // All other cases use an instance of the mock
    // Mocking view inside presenter, don't pass mock, but instance
    const mockAppNavbarPresenterViewInstance = instance(
      mockAppNavbarPresenterView
    );

    when(
      mockAppNavbarPresenterView.displayInfoMessage(anything(), 0)
    ).thenReturn("messageId123");

    const appNavbarPresenterSpy = spy(
      new AppNavbarPresenter(mockAppNavbarPresenterViewInstance)
    );
    appNavbarPresenter = instance(appNavbarPresenterSpy);

    mockService = mock<UserService>();

    when(appNavbarPresenterSpy.service).thenReturn(instance(mockService));
  });
  it("tells the view to display a logging out message", async () => {
    await appNavbarPresenter.logOut(authToken);
    verify(
      mockAppNavbarPresenterView.displayInfoMessage("Logging Out...", 0)
    ).once();
  });
  it("calls logout on the user service with the correct auth token", async () => {
    await appNavbarPresenter.logOut(authToken);
    verify(mockService.logout(authToken)).once();

    // We can also do:
    // let [capturedAuthToken] = capture(mockService.logout).last();
    // expect(capturedAuthToken).toEqual(authToken);
  });
  it("tells the view to clear the info message that was displayed previously, clears the user info, and navigates to the login page when successful", async () => {
    await appNavbarPresenter.logOut(authToken);

    verify(mockAppNavbarPresenterView.displayErrorMessage(anything())).never();
    
    // Clear info message
    verify(mockAppNavbarPresenterView.deleteMessage("messageId123")).once();

    // Clear user info
    verify(mockAppNavbarPresenterView.clearUserInfo()).once();

    // Navigate to login
    verify(mockAppNavbarPresenterView.navigateToLogin()).once();
  });
  it("tells the view to display an error message and does not tell it to clear the info message, clear the user info or navigate to the login page when unsuccessful", async () => {
    let error = new Error("An error occured");
    when(mockService.logout(anything())).thenThrow(error);

    await appNavbarPresenter.logOut(authToken);

    // To debug test:
    // let [errorString] = capture(
    //   mockAppNavbarPresenterView.displayErrorMessage
    // ).last();
    // console.log(errorString);

    // Display error message
    verify(
      mockAppNavbarPresenterView.displayErrorMessage(
        "Failed to log user out because of exception: An error occured"
      )
    ).once();

    // does not delete the message
    verify(mockAppNavbarPresenterView.deleteMessage(anything())).never();

    // does not clear user info
    verify(mockAppNavbarPresenterView.clearUserInfo()).never();

    // does not navigate to login
    verify(mockAppNavbarPresenterView.navigateToLogin()).never();
  });
});
