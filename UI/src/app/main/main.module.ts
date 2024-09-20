import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { MainComponent } from "./main.component";

@NgModule({
  declarations: [MainComponent],
  imports: [BrowserAnimationsModule, BrowserModule],
  providers: [],
  bootstrap: [MainComponent],
  exports: [MainComponent]
})
export class MainModule {}
