import { StatusDto } from "../../dto/StatusDto";
import { AuthenticatedTweeterRequest } from "./AuthenticatedTweeterRequest";

export interface PostStatusRequest extends AuthenticatedTweeterRequest {
    readonly newStatus: StatusDto
}