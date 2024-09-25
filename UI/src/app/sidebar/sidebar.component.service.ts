import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Level } from "./sidebar.model";

@Injectable({
  providedIn: "root"
})
export class SidebarComponentService {
  public currentLevel$: BehaviorSubject<Level | null> = new BehaviorSubject<Level | null>(null);

  constructor() {}

  public setLevel(level: Level | null): void {
    this.currentLevel$.next(level);
  }
}
