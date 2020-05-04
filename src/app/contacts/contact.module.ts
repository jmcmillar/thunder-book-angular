import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { ContactData } from './contact-data';

import { ContactListComponent } from './contact-list.component';
import { ContactDetailComponent } from './contact-detail.component';
import { ContactEditComponent } from './contact-edit.component';
import { ContactEditGuard } from './contact-edit.guard';

@NgModule({
  imports: [
    SharedModule,
    ReactiveFormsModule,
    InMemoryWebApiModule.forRoot(ContactData),
    RouterModule.forChild([
      { path: 'contacts', component: ContactListComponent },
      { path: 'contacts/:id', component: ContactDetailComponent },
      {
        path: 'contacts/:id/edit',
        canDeactivate: [ContactEditGuard],
        component: ContactEditComponent
      }
    ])
  ],
  declarations: [
    ContactListComponent,
    ContactDetailComponent,
    ContactEditComponent
  ]
})
export class ContactModule { }
