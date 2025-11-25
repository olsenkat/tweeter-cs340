import { FollowRequest, FollowResponse } from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";
import handleError from "../BaseHandler";

export const handler = async (
  request: FollowRequest
): Promise<FollowResponse> => {
  try {
    const serviceFactory = new ServiceFactory();
    const followService = serviceFactory.getFollowService();
    const [followerCount, followeeCount] = await followService.follow(
      request.token,
      request.userToFollow
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
