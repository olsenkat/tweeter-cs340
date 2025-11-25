import { LoginCreateBaseRequest } from "./LoginCreateBaseRequest";

export interface CreateUserRequest extends LoginCreateBaseRequest {
    readonly firstName: string,
    readonly lastName: string,
    // alias and password in base request
    readonly imageStringBase64: string,
    readonly imageFileExtension: string
}