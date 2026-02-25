import { Component, Input } from "@angular/core";
import { Level } from "../sidebar/sidebar.model";

@Component({
  selector: "app-level-caption",
  templateUrl: "./level-caption.component.html",
  styleUrls: ["./level-caption.component.scss"],
  standalone: true
})
export class LevelCaptionComponent {
  @Input() level!: Level;

  public readonly subtitles: Record<number, string> = {
    1: "Your personal top tracks",
    2: "Popular hits from the charts",
    3: "Random songs from the world"
  };
}
