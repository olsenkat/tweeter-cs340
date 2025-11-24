import {
  GetFollowerCountRequest,
  GetFollowerCountResponse,
} from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";

export const handler = async (
  request: GetFollowerCountRequest
): Promise<GetFollowerCountResponse> => {
  const serviceFactory = new ServiceFactory();
  const followService = serviceFactory.getFollowService();
  const followerCount = await followService.getFollowerCount(
    request.token,
    request.user
  );

  return {
    success: true,
    message: null,
    followerCount: followerCount,
  };
};
