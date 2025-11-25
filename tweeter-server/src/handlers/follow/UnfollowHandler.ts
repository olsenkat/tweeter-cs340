import { UnfollowRequest, UnfollowResponse } from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";
import handleError from "../BaseHandler";

export const handler = async (
  request: UnfollowRequest
): Promise<UnfollowResponse> => {
  try {
    const serviceFactory = new ServiceFactory();
    const followService = serviceFactory.getFollowService();
    const [followerCount, followeeCount] = await followService.unfollow(
      request.token,
      request.userToUnfollow
    );

    return {
      success: true,
      message: null,
      followerCount: followerCount,
      followeeCount: followeeCount,
    };
  } catch (err) {
    const { message } = handleError(err);
    return { success: false, message, followerCount: 0, followeeCount: 0 };
  }
};
