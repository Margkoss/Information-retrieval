import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class SearchService {
  private restURL: string;

  constructor(private http: HttpClient) {
    this.restURL = `${environment.backend.protocol}://${environment.backend.uri}:${environment.backend.port}/api`;
  }

  public search(query: string): Observable<any[]> {
    return this.http.get<any>(`${this.restURL}/movie`, {
      params: { search_query: query },
    });
  }
}
