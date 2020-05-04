import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { Contact } from './contact';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private contactsUrl = 'api/contacts';

  constructor(private http: HttpClient) { }

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.contactsUrl)
      .pipe(
       // tap(data => console.log(JSON.stringify(data))),
        catchError(this.handleError)
      );
  }

  getContact(id: number): Observable<Contact> {
    if (id === 0) {
      return of(this.initializeContact());
    }
    const url = `${this.contactsUrl}/${id}`;
    return this.http.get<Contact>(url)
      .pipe(
       // tap(data => console.log('getContact: ' + JSON.stringify(data))),
        catchError(this.handleError)
      );
  }

  createContact(contact: Contact): Observable<Contact> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    contact.id = null;
    return this.http.post<Contact>(this.contactsUrl, contact, { headers: headers })
      .pipe(
       // tap(data => console.log('createContact: ' + JSON.stringify(data))),
        catchError(this.handleError)
      );
  }

  deleteContact(id: number): Observable<{}> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.contactsUrl}/${id}`;
    return this.http.delete<Contact>(url, { headers: headers })
      .pipe(
       // tap(data => console.log('deleteContact: ' + id)),
        catchError(this.handleError)
      );
  }

  updateContact(contact: Contact): Observable<Contact> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.contactsUrl}/${contact.id}`;
    return this.http.put<Contact>(url, contact, { headers: headers })
      .pipe(
        tap(() => console.log('updateContact: ' + contact.id)),
        // Returns Contact
        map(() => contact),
        catchError(this.handleError)
      );
  }

  private handleError(err) {
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {

      errorMessage = `An error occurred: ${err.error.message}`;
    } else {

      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

  private initializeContact(): Contact {

    return {
      id: 0,
      contactName: null,
      contactPhone: null,
      contactAddress: null,
      contactEmail: null
    };
  }
}
