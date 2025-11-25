import { AuthTokenDto } from "../../dto/AuthTokenDto";
import { BaseUserResponse } from "./BaseUserResponse";

export interface CreateUserResponse extends BaseUserResponse {
    // readonly userDto: UserDto,
    readonly authTokenDto: AuthTokenDto
}