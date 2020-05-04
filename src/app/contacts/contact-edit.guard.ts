import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

import { ContactEditComponent } from './contact-edit.component';

@Injectable({
  providedIn: 'root'
})
export class ContactEditGuard implements CanDeactivate<ContactEditComponent> {
  canDeactivate(component: ContactEditComponent): Observable<boolean> | Promise<boolean> | boolean {
    if (component.contactForm.dirty) {
      const contactName = component.contactForm.get('contactName').value || 'New Contact';
      return confirm(`Changes haven't been saved to ${contactName}. Are you sure you want to exit.`);
    }
    return true;
  }
}
