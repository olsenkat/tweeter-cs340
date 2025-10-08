type RegisterParams = {
  firstName: string;
  lastName: string;
  alias: string;
  password: string;
  rememberMe: boolean;
  imageBytes: Uint8Array;
  imageFileExtension: string;
};
type LoginParams = {
  alias: string;
  password: string;
  rememberMe: boolean;
  originalUrl?: string;
};
