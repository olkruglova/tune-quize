import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Level } from "./sidebar.model";
import { SidebarComponentService } from "./sidebar.component.service";
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { filter, Subscription } from "rxjs";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.scss",
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  standalone: true
})
export class SidebarComponent implements OnInit, OnDestroy {
  public menuItems: Level[] = [
    { id: 1, name: "level1", title: "Level 1", class: "vinyl-I", color: "green", routerLink: "/quiz/level/1" },
    { id: 2, name: "level2", title: "Level 2", class: "vinyl-II", color: "yellow", routerLink: "/quiz/level/2" },
    { id: 3, name: "level3", title: "Level 3", class: "vinyl-III", color: "orange", routerLink: "/quiz/level/3" }
  ];

  private subscription: Subscription = new Subscription();

  constructor(private componentService: SidebarComponentService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.subscription.add(
      this.route?.firstChild?.url.subscribe((segments) => {
        const levelId = +segments[1].path;
        const level = this.menuItems.find((item) => item.id === levelId);

        if (level) {
          this.componentService.currentLevel$.next(level);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
