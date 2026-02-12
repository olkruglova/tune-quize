import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SpotifyTrack } from "./player-controls.model";

@Injectable({
  providedIn: "root"
})
export class PlayerControlsService {
  constructor(private readonly http: HttpClient) {}

  public getTrack(id: string | null): Observable<SpotifyTrack> {
    return this.http.get<SpotifyTrack>(`/api/tracks/${id}`);
  }
}
