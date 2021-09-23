import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { map, catchError, flatMap } from "rxjs/operators";

import { Category } from "../../shared/category.model";
import { element } from "protractor";

@Injectable({
  providedIn: "root",
})
export class CategoryService {
  private apiPatch: string = "api/categories";
  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http
      .get(this.apiPatch)
      .pipe(catchError(this.handlerError), map(this.jsonDataToCategories));
  }

  getById(id: number): Observable<Category> {
    const url = `${this.apiPatch}/${id}`;
    return this.http
      .get(url)
      .pipe(catchError(this.handlerError), map(this.jsonDataToCategory));
  }

  create(category: Category): Observable<Category> {
    return this.http
      .post(this.apiPatch, category)
      .pipe(catchError(this.handlerError), map(this.jsonDataToCategory));
  }

  update(category: Category): Observable<Category> {
    const url = `${this.apiPatch}/${category.id}`;
    return this.http.put(url, category).pipe(
      catchError(this.handlerError),
      map(() => category)
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

  private jsonDataToCategories(jsonData: any[]): Category[] {
    const categories: Category[] = [];
    jsonData.forEach((element) => categories.push(element as Category));

    return categories;
  }

  private jsonDataToCategory(jsonData: any): Category {
    return jsonData as Category;
  }

  private handlerError(error: any): Observable<any> {
    console.log("ERRO NA REQUEST => ", error);
    return throwError(error);
  }
}
