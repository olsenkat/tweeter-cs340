interface AuthParams {
  alias: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterParams extends AuthParams {
  firstName: string;
  lastName: string;
  imageBytes: Uint8Array;
  imageFileExtension: string;
};
interface LoginParams extends AuthParams {
  originalUrl?: string;
};
