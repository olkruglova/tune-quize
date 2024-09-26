import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { SidebarComponentService } from "../sidebar/sidebar.component.service";
import { Level } from "../sidebar/sidebar.model";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-level",
  templateUrl: "./level.component.html",
  styleUrl: "./level.component.scss",
  imports: [CommonModule],
  standalone: true
})
export class LevelComponent implements OnInit, OnDestroy {
  public currentLevel: Level | null = null;

  private subscription: Subscription = new Subscription();

  constructor(private sidebarService: SidebarComponentService) {}

  ngOnInit() {
    this.subscription.add(
      this.sidebarService.currentLevel$.subscribe((level: Level | null) => {
        this.currentLevel = level;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
