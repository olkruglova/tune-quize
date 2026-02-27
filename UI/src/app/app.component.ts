import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Subscription } from "rxjs";
import { SidebarComponentService } from "./sidebar/sidebar.component.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  standalone: true,
  imports: [CommonModule, RouterOutlet]
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  constructor(private sidebarService: SidebarComponentService) {}

  @ViewChild("content") content!: ElementRef;

  ngOnInit(): void {
    this.subscription.add(
      this.sidebarService.currentLevel$.subscribe((level) => {
        if (this.content) {
          this.content.nativeElement.className = "";

          if (level) {
            this.content?.nativeElement.classList?.add(level.color);
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
