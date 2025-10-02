import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import {
    CallIconComponent,
    MessageIconComponent,
    MailIconComponent,
    LocationIconComponent,
    CopyIconComponent,
    LinkIconComponent,
    TwitterIconComponent,
    LinkedInIconComponent,
    InstagramIconComponent,
    ChevronDownIconComponent
} from '../../shared/icons/contact-icons.component';
import { Subscription } from 'rxjs';

interface BreadcrumbItem {
    label: string;
    href?: string;
    isActive?: boolean;
}

@Component({
    selector: 'app-contact-us',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
        BreadcrumbComponent,
        CallIconComponent,
        MessageIconComponent,
        MailIconComponent,
        LocationIconComponent,
        CopyIconComponent,
        LinkIconComponent,
        TwitterIconComponent,
        LinkedInIconComponent,
        InstagramIconComponent,
        ChevronDownIconComponent
    ],
    templateUrl: './contact-us.component.html',
    styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit, OnDestroy {
    breadcrumbItems: BreadcrumbItem[] = [];
    contactForm: FormGroup;
    selectedFile: File | null = null;

    private langSubscription?: Subscription;

    constructor(
        private translate: TranslateService,
        private fb: FormBuilder
    ) {
        this.contactForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            phone: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            category: [''],
            subject: [''],
            message: ['']
        });
    }

    ngOnInit() {
        this.setupBreadcrumb();

        // Subscribe to language changes
        this.langSubscription = this.translate.onLangChange.subscribe(() => {
            this.setupBreadcrumb();
        });
    }

    ngOnDestroy() {
        if (this.langSubscription) {
            this.langSubscription.unsubscribe();
        }
    }

    private setupBreadcrumb() {
        this.breadcrumbItems = [
            {
                label: this.translate.instant('contactUs.breadcrumb.home'),
                href: '/'
            },
            {
                label: this.translate.instant('contactUs.breadcrumb.contact'),
                isActive: true
            }
        ];
    }

    copyToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copied to clipboard:', text);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }

    copyPhoneValue() {
        const phoneValue = this.translate.instant('contactUs.contactCard.phone.value');
        this.copyToClipboard(phoneValue);
    }

    copySmsValue() {
        const smsValue = this.translate.instant('contactUs.contactCard.sms.value');
        this.copyToClipboard(smsValue);
    }

    copyEmailValue() {
        const emailValue = this.translate.instant('contactUs.contactCard.email.value');
        this.copyToClipboard(emailValue);
    }

    copyFaxValue() {
        const faxValue = this.translate.instant('contactUs.contactCard.fax.value');
        this.copyToClipboard(faxValue);
    }

    onFileChange(event: any) {
        const file = event.target.files?.[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    onSubmit() {
        if (this.contactForm.valid) {
            const formData = {
                ...this.contactForm.value,
                file: this.selectedFile
            };
            console.log('Form submitted:', formData);
            // Handle form submission here
        } else {
            console.log('Form is invalid');
            // Mark all fields as touched to show validation errors
            Object.keys(this.contactForm.controls).forEach(key => {
                this.contactForm.get(key)?.markAsTouched();
            });
        }
    }

    // Helper method to check if a field has an error
    hasError(fieldName: string, errorType: string): boolean {
        const field = this.contactForm.get(fieldName);
        return field ? field.hasError(errorType) && field.touched : false;
    }

    // Helper method to get field error message
    getErrorMessage(fieldName: string): string {
        const field = this.contactForm.get(fieldName);
        if (field?.hasError('required')) {
            return `${fieldName} is required`;
        }
        if (field?.hasError('email')) {
            return 'Please enter a valid email address';
        }
        return '';
    }
}
