import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ScoreService {
  public score$ = new BehaviorSubject<number>(0);
  public combo$ = new BehaviorSubject<number>(0);

  addPoints(points: number): void {
    this.score$.next(this.score$.value + points);
  }

  incrementCombo(): void {
    this.combo$.next(this.combo$.value + 1);
  }

  resetCombo(): void {
    this.combo$.next(0);
  }
}
