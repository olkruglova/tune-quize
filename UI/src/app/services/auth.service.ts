import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private accessToken: string | null = null;
  public isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor() {
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem("spotify_access_token");
    if (storedToken) {
      this.accessToken = storedToken;
      this.isAuthenticated$.next(true);
    }
  }

  extractTokenFromUrl(): boolean {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken) {
      this.setToken(accessToken);
      if (refreshToken) {
        localStorage.setItem("spotify_refresh_token", refreshToken);
      }
      // Clear the hash from URL
      window.history.replaceState(null, "", window.location.pathname);
      return true;
    }
    return false;
  }

  setToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem("spotify_access_token", token);
    this.isAuthenticated$.next(true);
  }

  getToken(): string | null {
    return this.accessToken;
  }

  clearToken(): void {
    this.accessToken = null;
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    this.isAuthenticated$.next(false);
  }
}
