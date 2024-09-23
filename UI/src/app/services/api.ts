export type Endpoints = {
  GetToken: string;
  Login: string;
  GetProfile: string;
};

export const API: Endpoints = {
  GetToken: "http://localhost:3000/token",
  Login: "http://localhost:3000/login",
  GetProfile: "http://localhost:3000/callback"
};
