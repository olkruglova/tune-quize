import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SpotifyTrack } from "./player-controls.model";
import { API } from "../services/api";

@Injectable({
  providedIn: "root"
})
export class PlayerControlsService {
  constructor(private readonly http: HttpClient) {}

  public getTrack(id: string | null): Observable<SpotifyTrack> {
    return this.http.get<SpotifyTrack>(`/api/tracks/${id}`);
  }

  public saveTrack(trackId: string): Observable<any> {
    return this.http.put(API.SaveTrack, { trackId });
  }

  public checkSavedTracks(ids: string[]): Observable<boolean[]> {
    return this.http.get<boolean[]>(`${API.CheckSavedTracks}?ids=${ids.join(",")}`);
  }
}
