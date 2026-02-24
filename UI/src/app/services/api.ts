export type Endpoints = {
  StoreToken: string;
  GetProfile: string;
  GetTopTracks: string;
  GetPopularTracks: string;
  GetRandomTracks: string;
  SaveTrack: string;
  CheckSavedTracks: string;
};

export const API: Endpoints = {
  StoreToken: "/api/store-token",
  GetProfile: "/api/profile",
  GetTopTracks: "/api/top-tracks",
  GetPopularTracks: "/api/tracks/popular",
  GetRandomTracks: "/api/tracks/random",
  SaveTrack: "/api/tracks/save",
  CheckSavedTracks: "/api/tracks/check-saved"
};
