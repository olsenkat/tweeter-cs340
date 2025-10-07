import { AuthToken, User, FakeData } from "tweeter-shared";
import { useMessageActions } from "../toaster/MessageHooks";
import { useNavigate } from "react-router-dom";
import { useUserInfo, useUserInfoActions } from "./UserInfoHooks";

interface UserNavigate {
  navigateToUser: (
    event: React.MouseEvent<Element, MouseEvent>
  ) => Promise<void>;
}

interface Props 
{
    featurePath: string;
}

export const useUserNavigation = (props: Props): UserNavigate => {
  const { displayErrorMessage } = useMessageActions();
  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const navigate = useNavigate();

  const navigateToUser = async (event: React.MouseEvent): Promise<void> => {
    event.preventDefault();

    
    try {
      const alias = extractAlias(event.target.toString());

      const toUser = await getUser(authToken!, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser!)) {
          setDisplayedUser(toUser);
          navigate(`${props.featurePath}/${toUser.alias}`);
        }
      }
    } catch (error) {
      displayErrorMessage(`Failed to get user because of exception: ${error}`);
    }
  };

  const extractAlias = (value: string): string => {
    const index = value.indexOf("@");
    return value.substring(index);
  };

  const getUser = async (
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> => {
    // TODO: Replace with the result of calling server
    return FakeData.instance.findUserByAlias(alias);
  };

  return {
    navigateToUser
  };
};
