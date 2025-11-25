import {
  GetFollowerCountRequest,
  GetFollowerCountResponse,
} from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";
import handleError from "../BaseHandler";

export const handler = async (
  request: GetFollowerCountRequest
): Promise<GetFollowerCountResponse> => {
  try {
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
} catch (err) {
    const { message } = handleError(err);
    return { success: false, message, followerCount: 0 };
  }
};
