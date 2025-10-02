import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon.component';
import { RouterModule } from '@angular/router';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
  @Input() separator: string = '/';
  @Input() className: string = '';
}
