import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule, IconComponent, TranslateModule],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.css',
})
export class ServiceCardComponent {
  @Input() title!: string;
  @Input() titleKey?: string;
  @Input() icon!: string;
  @Input() href?: string;
  @Input() onClick?: () => void;

  onCardClick() {
    if (this.onClick) {
      this.onClick();
    } else if (this.href) {
      window.open(this.href, '_blank');
    }
  }
}
