// src/app/components/stats-bar/stats-bar.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-stats-bar',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="stats-bar">
      <div class="stat" *ngFor="let s of stats">
        {{ s.value }} {{ s.label }}
      </div>
    </div>
  `,
    styleUrls: ['./stats-bar.component.scss']
})
export class StatsBarComponent {
    @Input() stats: { label: string; value: number }[] = [];
}
