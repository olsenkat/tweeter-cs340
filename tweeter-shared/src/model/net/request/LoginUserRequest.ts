import { StatusDto } from "../../dto/StatusDto";
import { TweeterRequest } from "./TweeterRequest";

export interface LoginUserRequest extends TweeterRequest {
    readonly alias: string,
    readonly password: string
}