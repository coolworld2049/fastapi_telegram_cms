import {Configuration, LoginApi, UsersApi} from "./src/generated";

const readAccessToken = async (): Promise<string> => {
  return localStorage.getItem("token") || "";
};

export const basePath: string | undefined = import.meta.env.VITE_REST_URL || '';

const apiConfig: Configuration = new Configuration({
  accessToken: readAccessToken,
  basePath ,
});

export const authApi: LoginApi = new LoginApi(apiConfig);
export const userApi: UsersApi = new UsersApi(apiConfig);
