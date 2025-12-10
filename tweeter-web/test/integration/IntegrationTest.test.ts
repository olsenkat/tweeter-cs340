import { AuthToken, LoginUserRequest, PagedUserItemRequest, PostStatusRequest, StatusDto } from "tweeter-shared";
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
import { ServerFacade } from "../../src/model.service/network/ServerFacade";
import { server } from "typescript";

describe("IntegrationTests", () => {
  let serverFacade: ServerFacade;

  const loginUserRequest: LoginUserRequest = {
    alias: "@katie",
    password: "password"
  };
  let mockPostStatusPresenterView: PostStatusView;
  let postStatusPresenter: PostStatusPresenter;

  beforeEach(() => {
    serverFacade = new ServerFacade();

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
    
  });

  // Test Function 1
  it("logs in a user, posts a status, verifies status, retrieves story", async () => {
    // Login User
    const [user, authToken ] = await serverFacade.loginUser(loginUserRequest);
    const timestamp = Date.now();
    const userPlain = {
        alias: user.alias,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl
    }
    const status: PostStatusRequest = {
      newStatus: {
        post: "This is a test status post." + timestamp,
        user: userPlain,
        timestamp: timestamp
      },
      token: authToken.token
    };

    // Post Status
    await postStatusPresenter.submitPost(status.newStatus.post, user, authToken);

    // Verify that Successfully Posted message was displayed
    verify(
      mockPostStatusPresenterView.displayInfoMessage("Status posted!",  2000)).once();

    // Retrieve user story from server to verify the new status was
    // correctly appended to the user story, and status details are correct
    const request: PagedUserItemRequest<StatusDto> = {
        token: authToken.token,
        userAlias: user.alias,
        pageSize: 25,
        lastItem: null
    };
    const storyResponse = await serverFacade.loadMoreStoryItems(request);
    const [statuses, hasMore] = storyResponse;

    // Verify the most recent status is the one we just posted
    const retrievedStatus = statuses[0];
    expect(retrievedStatus.post).toBe(status.newStatus.post);
    expect(retrievedStatus.user.alias).toBe(user.alias);

    expect(typeof retrievedStatus.timestamp).toBe("number");

    expect(retrievedStatus.user.firstName).toBe(user.firstName);
    expect(retrievedStatus.user.lastName).toBe(user.lastName);
    expect(retrievedStatus.user.imageUrl).toBe(user.imageUrl);
    expect(typeof hasMore).toBe("boolean")
  }, 20000);

});
