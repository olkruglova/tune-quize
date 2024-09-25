import { Routes } from "@angular/router";
import { MainComponent } from "./main/main.component";
import { LevelComponent } from "./level/level.component";

export const routes: Routes = [
  {
    path: "quiz",
    component: MainComponent,
    children: [
      {
        path: "level/:level",
        component: LevelComponent,
        pathMatch: "full"
      }
    ]
  },
  //   { path: 'second-component', component: SecondComponent },
  { path: "**", redirectTo: "", pathMatch: "full" }
  //   { path: '**', component: PageNotFoundComponent },
];
