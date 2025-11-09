import { GetUserRequest, GetUserResponse, LoginUserRequest, LoginUserResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (request: LoginUserRequest): Promise<LoginUserResponse> => {
    const userService = new UserService();
    let [ userDto, authTokenDto ] = await userService.loginUser(request.alias, request.password)

    return {
        success: true,
        message: null,
        userDto: userDto,
        authTokenDto: authTokenDto
    }
}