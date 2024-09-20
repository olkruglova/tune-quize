import { API } from "./api";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  public isLoading$ = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient) {}

  public getToken(): Observable<any> {
    this.isLoading$.next(true);

    return this.http.post<any>(API.GetToken, {}).pipe(
      map((response: any) => {
        this.isLoading$.next(false);
        return response;
      }),
      catchError((error) => {
        console.error("Error fetching token", error);
        this.isLoading$.next(false);
        return of(null);
      })
    );
  }
}
