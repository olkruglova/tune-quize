import { Component, ElementRef, EventEmitter, Input, AfterViewInit, OnChanges, Output, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-audio-visualizer",
  templateUrl: "./audio-visualizer.component.html",
  styleUrls: ["./audio-visualizer.component.scss"],
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None
})
export class AudioVisualizerComponent implements AfterViewInit, OnChanges {
  @Input() isPlaying = false;
  @Input() disabled = false;
  @Output() toggle = new EventEmitter<void>();

  @ViewChild("waveformRef") waveformRef!: ElementRef<HTMLElement>;

  private readonly totalBars = 80;
  private readonly center = this.totalBars / 2;
  private barElements: HTMLElement[] = [];

  ngAfterViewInit(): void {
    const waveform = this.waveformRef.nativeElement;

    for (let i = 0; i < this.totalBars; i++) {
      const bar = document.createElement("div");
      bar.className = "bar";

      const distFromCenter = Math.abs(i - this.center);
      const normalized = 1 - distFromCenter / this.center;
      const inCircle = distFromCenter < 14;

      if (inCircle) {
        bar.style.setProperty("--min-h", "4px");
        bar.style.setProperty("--max-h", Math.max(6, normalized * 20) + "px");
        bar.style.opacity = "0.2";
      } else {
        const maxH = Math.round(30 + normalized * 80 + Math.random() * 30);
        const minH = Math.round(maxH * 0.3);
        bar.style.setProperty("--min-h", minH + "px");
        bar.style.setProperty("--max-h", maxH + "px");
      }

      bar.style.setProperty("--dur", 0.4 + Math.random() * 1.2 + "s");
      bar.style.animationDelay = Math.random() * 1.5 + "s";
      bar.style.animationPlayState = this.isPlaying ? "running" : "paused";

      waveform.appendChild(bar);
      this.barElements.push(bar);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isPlaying"] && this.barElements.length > 0) {
      const state = this.isPlaying ? "running" : "paused";
      this.barElements.forEach((bar) => (bar.style.animationPlayState = state));
    }
  }

  handleClick(): void {
    if (!this.disabled) {
      this.toggle.emit();
    }
  }
}
