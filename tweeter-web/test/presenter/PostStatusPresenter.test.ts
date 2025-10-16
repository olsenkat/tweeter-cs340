import { AuthToken } from "tweeter-shared";
import { StatusService } from "../../src/model.service/StatusService";
import {
  PostStatusView,
  PostStatusPresenter,
} from "../../src/presenter/PostStatusPresenter";
import {
  anything,
  capture,
  instance,
  mock,
  spy,
  verify,
  when,
} from "@typestrong/ts-mockito";

describe("PostStatusPresenter", () => {
  let mockPostStatusPresenterView: PostStatusView;
  let postStatusPresenter: PostStatusPresenter;
  let mockService: StatusService;

  const authToken = new AuthToken("test", Date.now()); // Will need to change for real data
  const post = "this is my test post.";
  beforeEach(() => {
    // Mock PostStatus View and Instance
    mockPostStatusPresenterView = mock<PostStatusView>();
    const mockPostStatusPresenterViewInstance = instance(
      mockPostStatusPresenterView
    );

    // For testing the message id
    when(
      mockPostStatusPresenterView.displayInfoMessage(anything(), 0)
    ).thenReturn("messageId123");

    // Spy Post Status Presenter and Instance
    const postStatusPresenterSpy = spy(
      new PostStatusPresenter(mockPostStatusPresenterViewInstance)
    );
    postStatusPresenter = instance(postStatusPresenterSpy);

    // Mock Service
    mockService = mock<StatusService>();

    // If the service is called, get the Mock Service
    when(postStatusPresenterSpy.service).thenReturn(instance(mockService));
  });

  // Test Function 1
  it("tells the view to display a posting status message", async () => {
    await postStatusPresenter.submitPost(anything(), anything(), authToken);

    // Verify status is posted with the right info message
    verify(
      mockPostStatusPresenterView.displayInfoMessage("Posting status...", 0)
    ).once();
  });

  // Test Function 2
  it("calls postStatus on the post status service with the correct status string and auth token.", async () => {
    await postStatusPresenter.submitPost(post, anything(), authToken);

    // Ensure it ran once
    verify(mockService.postStatus(authToken, anything())).once();

    // Capture the actual auth token and status
    let [capturedAuthToken, capturedStatus] = capture(
      mockService.postStatus
    ).last();

    // Ensure they equal what we set in
    expect(capturedAuthToken).toEqual(authToken);
    expect(capturedStatus.post).toEqual(post);
  });

  // Test Function 3
  it("tells the view to clear the info message that was displayed previously, clear the post, and display a status posted message if status posted successfully", async () => {
    await postStatusPresenter.submitPost(post, anything(), authToken);

    // Clear Info Message
    verify(mockPostStatusPresenterView.deleteMessage("messageId123")).once();

    // Check there is no Error
    verify(mockPostStatusPresenterView.displayErrorMessage(anything())).never();

    // Clear Post
    verify(mockPostStatusPresenterView.setPost("")).once();

    // Display Status Message
    verify(
      mockPostStatusPresenterView.displayInfoMessage("Status posted!", 2000)
    ).once();
  });

  // Test Function 4
  it("tells the view to clear the info message and display an error message but does not tell it to clear the post or display a status posted message if post unsuccessful", async () => {
    // Set error for service call
    let error = new Error("An error occured");
    when(mockService.postStatus(anything(), anything())).thenThrow(error);

    // Service call to Post should be unsuccessful
    await postStatusPresenter.submitPost(post, anything(), authToken);

    // Clear the info message
    verify(mockPostStatusPresenterView.deleteMessage("messageId123")).once();

    // Display Error Message
    verify(
      mockPostStatusPresenterView.displayErrorMessage(
        "Failed to post the status because of exception: An error occured"
      )
    ).once();

    // Does not tell to clear post
    verify(mockPostStatusPresenterView.setPost("")).never();

    // Does not tell to display 'Status Posted' message
    verify(
      mockPostStatusPresenterView.displayInfoMessage("Status posted!", 2000)
    ).never();
  });
});
