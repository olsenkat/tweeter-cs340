import { LogoutUserRequest, LogoutUserResponse } from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";

export const handler = async (
  request: LogoutUserRequest
): Promise<LogoutUserResponse> => {
  const serviceFactory = new ServiceFactory();
  const userService = serviceFactory.getUserService();
  await userService.logoutUser(request.token);

  return {
    success: true,
    message: null,
  };
};
