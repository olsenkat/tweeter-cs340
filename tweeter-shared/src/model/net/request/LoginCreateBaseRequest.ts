import { TweeterRequest } from "./TweeterRequest";

export interface LoginCreateBaseRequest extends TweeterRequest {
    readonly alias: string,
    readonly password: string
}