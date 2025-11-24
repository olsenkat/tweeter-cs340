import {
  GetIsFollowerStatusRequest,
  GetIsFollowerStatusResponse,
} from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";

export const handler = async (
  request: GetIsFollowerStatusRequest
): Promise<GetIsFollowerStatusResponse> => {
  const serviceFactory = new ServiceFactory();
  const followService = serviceFactory.getFollowService();
  const isFollower = await followService.getIsFollowerStatus(
    request.token,
    request.user,
    request.selectedUser
  );

  return {
    success: true,
    message: null,
    isFollower: isFollower,
  };
};
