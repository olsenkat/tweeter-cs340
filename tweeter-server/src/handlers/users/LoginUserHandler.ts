import { LoginUserRequest, LoginUserResponse } from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";

export const handler = async (
  request: LoginUserRequest
): Promise<LoginUserResponse> => {
  const serviceFactory = new ServiceFactory();
  const userService = serviceFactory.getUserService();
  let [userDto, authTokenDto] = await userService.loginUser(
    request.alias,
    request.password
  );

  return {
    success: true,
    message: null,
    userDto: userDto,
    authTokenDto: authTokenDto,
  };
};
