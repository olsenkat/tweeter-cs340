import { CreateUserRequest, CreateUserResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (
  request: CreateUserRequest
): Promise<CreateUserResponse> => {
  const userService = new UserService();
  let [ userDto, authTokenDto ] = await userService.registerUser(
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
    authTokenDto: authTokenDto
  };
};
