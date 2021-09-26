import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { map, catchError, flatMap } from "rxjs/operators";

import { Entry } from "./entry.model"; 


@Injectable({
  providedIn: "root",
})
export class EntryService {
  private apiPatch: string = "api/entries";
  constructor(private http: HttpClient) {}

  getAll(): Observable<Entry[]> {
    return this.http
      .get(this.apiPatch)
      .pipe(catchError(this.handlerError), map(this.jsonDataToEntries));
  }

  getById(id: number): Observable<Entry> {
    const url = `${this.apiPatch}/${id}`;
    return this.http
      .get(url)
      .pipe(catchError(this.handlerError), map(this.jsonDataToEntry));
  }

  create(entry: Entry): Observable<Entry> {
    return this.http
      .post(this.apiPatch, entry)
      .pipe(catchError(this.handlerError), map(this.jsonDataToEntry));
  }

  update(entry: Entry): Observable<Entry> {
    const url = `${this.apiPatch}/${entry.id}`;
    return this.http.put(url, entry).pipe(
      catchError(this.handlerError),
      map(() => entry)
    );
  }

  delete(id: number): Observable<any> {
    const url = `${this.apiPatch}/${id}`;
    return this.http.delete(url)
    .pipe(
      catchError(this.handlerError),
      map(() => null)
    )
  }

  private jsonDataToEntries(jsonData: any[]): Entry[] {
    const entries: Entry[] = [];
    jsonData.forEach((element) => entries.push(  Object.assign(new Entry(), element)    ));

    return entries;
  }

  private jsonDataToEntry(jsonData: any): Entry {
    return jsonData as Entry;
  }

  private handlerError(error: any): Observable<any> {
    console.log("ERRO NA REQUEST => ", error);
    return throwError(error);
  }
}
