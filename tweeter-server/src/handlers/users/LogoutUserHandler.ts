import { LogoutUserRequest, LogoutUserResponse } from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";
import handleError from "../BaseHandler";

export const handler = async (
  request: LogoutUserRequest
): Promise<LogoutUserResponse> => {
  try {
    const serviceFactory = new ServiceFactory();
    const userService = serviceFactory.getUserService();
    await userService.logoutUser(request.token);

    return {
      success: true,
      message: null,
    };
  } catch (err) {
    const { message } = handleError(err);
    return { success: false, message };
  }
};
