import { Routes } from "@angular/router";
import { MainComponent } from "./main/main.component";
import { PlayerControlsComponent } from "./player-controls/player-controls.component";

export const routes: Routes = [
  { path: "", redirectTo: "quiz", pathMatch: "full" },
  {
    path: "quiz",
    component: MainComponent,
    children: [
      {
        path: "level/:level",
        component: PlayerControlsComponent,
        pathMatch: "full"
      }
    ]
  },
  { path: "**", redirectTo: "quiz", pathMatch: "full" }
];
