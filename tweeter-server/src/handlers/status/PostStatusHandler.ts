import { PostStatusRequest, PostStatusResponse } from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";
import handleError from "../BaseHandler";

export const handler = async (
  request: PostStatusRequest
): Promise<PostStatusResponse> => {
  try {
    const serviceFactory = new ServiceFactory();
  const statusService = serviceFactory.getStatusService();
  await statusService.postStatus(request.token, request.newStatus);

  return {
    success: true,
    message: null,
  };
} catch (err) {
    const { message } = handleError(err);
    return { success: false, message };
  }
};
