import { AuthTokenDto } from "../../dto/AuthTokenDto";
import { UserDto } from "../../dto/UserDto";
import { TweeterResponse } from "./TweeterResponse";

export interface LoginUserResponse extends TweeterResponse {
    readonly userDto: UserDto,
    readonly authTokenDto: AuthTokenDto
}