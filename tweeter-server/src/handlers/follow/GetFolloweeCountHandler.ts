import {
  GetFolloweeCountRequest,
  GetFolloweeCountResponse,
} from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";

export const handler = async (
  request: GetFolloweeCountRequest
): Promise<GetFolloweeCountResponse> => {
  const serviceFactory = new ServiceFactory();
  const followService = serviceFactory.getFollowService();
  const followeeCount = await followService.getFolloweeCount(
    request.token,
    request.user
  );

  return {
    success: true,
    message: null,
    followeeCount: followeeCount,
  };
};
