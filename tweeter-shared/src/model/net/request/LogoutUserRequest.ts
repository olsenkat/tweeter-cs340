import { TweeterRequest } from "./TweeterRequest";

export interface LogoutUserRequest extends TweeterRequest {
    readonly token: string
}