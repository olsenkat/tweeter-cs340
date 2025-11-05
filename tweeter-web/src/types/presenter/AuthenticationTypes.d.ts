interface AuthParams {
  alias: string;
  password: string;
  rememberMe: boolean;
  originalUrl?: string;
}

interface RegisterParams extends AuthParams {
  firstName: string;
  lastName: string;
  imageBytes: Uint8Array;
  imageFileExtension: string;
}
interface LoginParams extends AuthParams {
  // Nothing added
}
