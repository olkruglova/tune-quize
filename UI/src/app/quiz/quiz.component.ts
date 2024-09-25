import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { SidebarComponentService } from "../sidebar/sidebar.component.service";
import { Level } from "../sidebar/sidebar.model";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-quiz",
  templateUrl: "./quiz.component.html",
  styleUrl: "./quiz.component.scss",
  imports: [CommonModule, RouterOutlet],
  standalone: true
})
export class QuizComponent implements OnInit, OnDestroy {
  public currentLevel: Level | null = null;
  public userName: string = "User User";

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
