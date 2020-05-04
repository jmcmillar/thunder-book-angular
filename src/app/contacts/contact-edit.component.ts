import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, FormControlName } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription, fromEvent, merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { Contact } from './contact';
import { ContactService } from './contact.service';

import { NumberValidators } from '../shared/number.validator';
import { GenericValidator } from '../shared/generic-validator';

@Component({
  templateUrl: './contact-edit.component.html'
})
export class ContactEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  pageTitle = 'Contact Edit';
  errorMessage: string;
  contactForm: FormGroup;

  contact: Contact;
  private sub: Subscription;

  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;


  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService) {

    // Defines all of the validation messages for the form.
    // These could instead be retrieved from a file or database.
    this.validationMessages = {
      contactName: {
        required: 'Name is required.'
      },
      contactAddress: {
        required: 'Address is required.'
      },  
       contactPhone: {
        required: 'Phone is required.'
      }
    };

    // Define an instance of the validator for use with this form,
    // passing in this form's set of validation messages.
    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      contactName: ['', [Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50)]],
      contactAddress: ['', Validators.required],
      contactPhone: ['', Validators.required],
      contactEmail: ['', Validators.required]

    });

    // Read the contact Id from the route parameter
    this.sub = this.route.paramMap.subscribe(
      params => {
        const id = +params.get('id');
        this.getContact(id);
      }
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    merge(this.contactForm.valueChanges, ...controlBlurs).pipe(
      debounceTime(800)
    ).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.contactForm);
    });
  }


  getContact(id: number): void {
    this.contactService.getContact(id)
      .subscribe(
        (contact: Contact) => this.displayContact(contact),
        (error: any) => this.errorMessage = <any>error
      );
  }

  displayContact(contact: Contact): void {
    if (this.contactForm) {
      this.contactForm.reset();
    }
    this.contact = contact;

    if (this.contact.id === 0) {
      this.pageTitle = 'Add Contact';
    } else {
      this.pageTitle = `Edit Contact: ${this.contact.contactName}`;
    }

    // Update the data on the form
    this.contactForm.patchValue({
      contactName: this.contact.contactName,
      contactAddress: this.contact.contactAddress,
      contactPhone: this.contact.contactPhone,
      contactEmail: this.contact.contactEmail
    });
  
  }

  deleteContact(): void {
    if (this.contact.id === 0) {
      // Don't delete, it was never saved.
      this.onSaveComplete();
    } else {
      if (confirm(`Are you sure you want to delete ${this.contact.contactName}?`)) {
        this.contactService.deleteContact(this.contact.id)
          .subscribe(
            () => this.onSaveComplete(),
            (error: any) => this.errorMessage = <any>error
          );
      }
    }
  }

  saveContact(): void {
    if (this.contactForm.valid) {
      if (this.contactForm.dirty) {
        const p = { ...this.contact, ...this.contactForm.value };

        if (p.id === 0) {
          this.contactService.createContact(p)
            .subscribe(
              () => this.onSaveComplete(),
              (error: any) => this.errorMessage = <any>error
            );
        } else {
          this.contactService.updateContact(p)
            .subscribe(
              () => this.onSaveComplete(),
              (error: any) => this.errorMessage = <any>error
            );
        }
      } else {
        this.onSaveComplete();
      }
    } else {
      this.errorMessage = 'Please correct the validation errors.';
    }
  }

  onSaveComplete(): void {
    // Reset the form to clear the flags
    this.contactForm.reset();
    this.router.navigate(['/contacts']);
  }
}
