import PostStatus from "../../../src/components/postStatus/PostStatus";

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserEvent, userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";

import { mock, instance, verify } from "@typestrong/ts-mockito";
import { PostStatusPresenter } from "../../../src/presenter/PostStatusPresenter";
import { useUserInfo } from "../../../src/components/userInfo/UserInfoHooks";
import { AuthToken, User } from "tweeter-shared";

library.add(fab);

// Makes it so we can mock the UserInfoHooks
jest.mock("../../../src/components/userInfo/UserInfoHooks", () => ({
  ...jest.requireActual("../../../src/components/userInfo/UserInfoHooks"),
  __esModule: true,
  useUserInfo: jest.fn(),
}));

// Creates mock instances of User and AuthToken so we can access functionality
const mockUserInstance: User = new User("Katie", "Olsen", "@katie", "imageUrl");
const mockAuthTokenInstance: AuthToken = new AuthToken("token", Date.now());

// ----------------------------------------------------------
//                      Begin test suite
// ----------------------------------------------------------
describe("Post Status", () => {
  // Init mock funcitons
  beforeAll(() => {
    // set the currentUser and authToken so we can access functionality
    (useUserInfo as jest.Mock).mockReturnValue({
      currentUser: mockUserInstance,
      authToken: mockAuthTokenInstance,
    });
  });

  // When first rendered the Post Status and Clear buttons are both disabled
  it("starts with Post Status and Clear buttons both disabled", () => {
    const { postStatusButton, clearButton } = renderPostStatusAndGetElement();
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  // Both buttons are enabled when the text field has text
  it("enables both buttons when the text field has text", async () => {
    const { postStatusButton, clearButton, textField, user } =
      renderPostStatusAndGetElement();

    await testEnabledButtons(user, postStatusButton, clearButton, textField);
  });

  // Both buttons are disabled when the text field is cleared
  it("disables both buttons when the text field is cleared", async () => {
    const { postStatusButton, clearButton, textField, user } =
      renderPostStatusAndGetElement();

    await testEnabledButtons(user, postStatusButton, clearButton, textField);

    await user.clear(textField); // Clear the test field

    // They should both be disabled
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  // The presenter's postStatus method is called with correct parameters when the Post Status button is pressed.
  it("calls the presenter's postStatus method with correct parameters when the Post Status button is pressed", async () => {
    // Set up mock presenter and instance
    const mockPresenter = mock<PostStatusPresenter>();
    const mockPresenterInstance = instance(mockPresenter);

    // Test post text
    const postStatusText = "This is my Status Post, yay!!";

    // Get the HTML elements
    const { postStatusButton, textField, user } = renderPostStatusAndGetElement(
      mockPresenterInstance
    );

    // Wait for the user to type status and press the button
    await user.type(textField, postStatusText);
    await user.click(postStatusButton);

    // Verify that the post was submitted with these values once
    verify(
      mockPresenter.submitPost(
        postStatusText,
        mockUserInstance,
        mockAuthTokenInstance
      )
    ).once();
  });
});

// Tests if the buttons are enabled when we types a status
async function testEnabledButtons(
  user: UserEvent,
  postStatusButton: HTMLElement,
  clearButton: HTMLElement,
  textField: HTMLElement
) {
  await user.type(textField, "This is my Status");

  expect(postStatusButton).toBeEnabled();
  expect(clearButton).toBeEnabled();
}

// Renders the Component with or without a specified presenter
function renderPostStatus(presenter?: PostStatusPresenter) {
  return render(
    <MemoryRouter>
      {!!presenter ? <PostStatus presenter={presenter} /> : <PostStatus />}
    </MemoryRouter>
  );
}

// Uses the above function to render, and returns the element
function renderPostStatusAndGetElement(presenter?: PostStatusPresenter) {
  // Set up the user
  const user = userEvent.setup();

  // Call above function
  renderPostStatus(presenter);

  // set elements for buttons and text field
  const postStatusButton = screen.getByRole("button", { name: /Post Status/i });
  const clearButton = screen.getByRole("button", { name: /Clear/i });
  const textField = screen.getByLabelText("postStatusTextArea");

  // return these elements
  return { user, postStatusButton, clearButton, textField };
}
