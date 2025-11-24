import { PostStatusRequest, PostStatusResponse } from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";

export const handler = async (
  request: PostStatusRequest
): Promise<PostStatusResponse> => {
  const serviceFactory = new ServiceFactory();
  const statusService = serviceFactory.getStatusService();
  await statusService.postStatus(request.token, request.newStatus);

  return {
    success: true,
    message: null,
  };
};
