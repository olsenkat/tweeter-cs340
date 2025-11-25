import { AuthenticatedTweeterRequest } from "./AuthenticatedTweeterRequest";

export interface PagedUserItemRequest<T> extends AuthenticatedTweeterRequest {
    readonly userAlias: string,
    readonly pageSize: number,
    readonly lastItem: T | null
}