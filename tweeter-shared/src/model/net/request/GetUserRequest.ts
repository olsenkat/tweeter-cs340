import { StatusDto } from "../../dto/StatusDto";
import { TweeterRequest } from "./TweeterRequest";

export interface GetUserRequest extends TweeterRequest {
    readonly token: string,
    readonly alias: string
}