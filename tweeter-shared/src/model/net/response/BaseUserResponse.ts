import { AuthTokenDto } from "../../dto/AuthTokenDto";
import { UserDto } from "../../dto/UserDto";
import { TweeterResponse } from "./TweeterResponse";

export interface BaseUserResponse extends TweeterResponse {
    readonly userDto: UserDto,
}