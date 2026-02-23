import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ScoreService {
  public score$ = new BehaviorSubject<number>(0);

  addPoints(points: number): void {
    this.score$.next(this.score$.value + points);
  }
}
