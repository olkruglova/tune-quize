import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { Subscription } from "rxjs";
import { environment } from "../environments/environment";
import { UserService } from "./services/user.service";
import { SidebarComponentService } from "./sidebar/sidebar.component.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive]
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private sidebarService: SidebarComponentService,
    private router: Router
  ) {}

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

  login(): void {
    window.location.href = `${environment.apiUrl}/login`;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
