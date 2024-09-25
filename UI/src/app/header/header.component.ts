import { Subscription } from "rxjs";
import { UserService } from "./../services/user.service";
import { Component, OnDestroy, OnInit } from "@angular/core";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
  standalone: true
})
export class HeaderComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.subscription.add(
      this.userService.userProfile$.subscribe((user: any) => {
        console.log(user);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
