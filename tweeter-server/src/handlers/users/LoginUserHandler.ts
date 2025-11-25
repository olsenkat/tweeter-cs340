import { LoginUserRequest, LoginUserResponse } from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";
import handleError from "../BaseHandler";

export const handler = async (
  request: LoginUserRequest
): Promise<LoginUserResponse> => {
  try {
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
  } catch (err) {
    const { message } = handleError(err);
    return {
      success: false,
      message,
      userDto: { alias: "", firstName: "", lastName: "", imageUrl: "" },
      authTokenDto: { token: "", timestamp: 0 },
    };
  }
};
