import { GetUserRequest, GetUserResponse } from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";
import handleError from "../BaseHandler";

export const handler = async (
  request: GetUserRequest
): Promise<GetUserResponse> => {
  try {
    const serviceFactory = new ServiceFactory();
    const userService = serviceFactory.getUserService();
    let user = await userService.getUser(request.token, request.alias);

    return {
      success: true,
      message: null,
      userDto: user,
    };
  } catch (err) {
    const { message } = handleError(err);
    return {
      success: false,
      message,
      userDto: {
        firstName: "",
        alias: "",
        lastName: "",
        imageUrl: "",
      },
    };
  }
};
