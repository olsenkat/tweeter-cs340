import { FollowRequest, FollowResponse } from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";

export const handler = async (
  request: FollowRequest
): Promise<FollowResponse> => {
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
};
