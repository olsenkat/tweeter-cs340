import { AuthTokenDto } from "../../dto/AuthTokenDto";
import { UserDto } from "../../dto/UserDto";
import { BaseUserResponse } from "./BaseUserResponse";
import { TweeterResponse } from "./TweeterResponse";

export interface LoginUserResponse extends BaseUserResponse {
    // readonly userDto: UserDto,
    readonly authTokenDto: AuthTokenDto
}