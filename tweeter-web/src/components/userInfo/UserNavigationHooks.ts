import { useMessageActions } from "../toaster/MessageHooks";
import { useNavigate } from "react-router-dom";
import { useUserInfo, useUserInfoActions } from "./UserInfoHooks";
import {
  UserNavigationHooksPresenter,
  UserNavigationHooksView,
} from "../../presenter/UserNavigationHooksPresenter";
import { useRef } from "react";

interface UserNavigate {
  navigateToUser: (
    event: React.MouseEvent<Element, MouseEvent>
  ) => Promise<void>;
}

interface Props {
  featurePath: string;
  presenterFactory: (
    view: UserNavigationHooksView
  ) => UserNavigationHooksPresenter;
}

export const useUserNavigation = (props: Props): UserNavigate => {
  const { displayErrorMessage } = useMessageActions();
  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const navigate = useNavigate();

  const listener: UserNavigationHooksView = {
    displayErrorMessage: displayErrorMessage,
    setDisplayedUser: setDisplayedUser,
    navigate: navigate,
  }; // Observer

  const presenterRef = useRef<UserNavigationHooksPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = props.presenterFactory(listener);
  }

  const navigateToUser = async (event: React.MouseEvent): Promise<void> => {
    event.preventDefault();
    return presenterRef.current!.navigateToUser(
      event,
      authToken,
      displayedUser,
      props.featurePath
    );
  };

  return {
    navigateToUser,
  };
};
