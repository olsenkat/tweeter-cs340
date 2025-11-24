import { UnfollowRequest, UnfollowResponse } from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";

export const handler = async (
  request: UnfollowRequest
): Promise<UnfollowResponse> => {
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
};
