import {
  GetFolloweeCountRequest,
  GetFolloweeCountResponse,
} from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";
import handleError from "../BaseHandler";

export const handler = async (
  request: GetFolloweeCountRequest
): Promise<GetFolloweeCountResponse> => {
  try {
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
  } catch (err) {
    const { message } = handleError(err);
    return { success: false, message, followeeCount: 0 };
  }
};
