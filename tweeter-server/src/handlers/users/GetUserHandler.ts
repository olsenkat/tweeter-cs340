import { GetUserRequest, GetUserResponse } from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";

export const handler = async (
  request: GetUserRequest
): Promise<GetUserResponse> => {
  const serviceFactory = new ServiceFactory();
  const userService = serviceFactory.getUserService();
  let user = await userService.getUser(request.token, request.alias);

  return {
    success: true,
    message: null,
    userDto: user,
  };
};
