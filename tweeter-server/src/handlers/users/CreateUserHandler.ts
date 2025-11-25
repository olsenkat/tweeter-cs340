import { CreateUserRequest, CreateUserResponse } from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";
import handleError from "../BaseHandler";

export const handler = async (
  request: CreateUserRequest
): Promise<CreateUserResponse> => {
  try {
    const serviceFactory = new ServiceFactory();
    const userService = serviceFactory.getUserService();

    let [userDto, authTokenDto] = await userService.registerUser(
      request.firstName,
      request.lastName,
      request.alias,
      request.password,
      request.imageStringBase64,
      request.imageFileExtension
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
