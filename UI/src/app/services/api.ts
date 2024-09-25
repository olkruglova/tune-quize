export type Endpoints = {
  Login: string;
  GetProfile: string;
  Callback?: string;
};

export const API: Endpoints = {
  Login: "http://localhost:3000/login",
  GetProfile: "http://localhost:3000/profile",
  Callback: "http://localhost:3000/callback"
};
