import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Note, NoteLabel } from './dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  readonly baseApiUrl = 'https://61ee5f30d593d20017dbad98.mockapi.io/pinguin/api';

  constructor(private http: HttpClient) { }

  getNotes(): Observable<{notes: Note[]}> {
    return this.http.get<{notes: Note[]}>(this.baseApiUrl + '/notes');
  }

  getNoteLabels(): Observable<NoteLabel[]> {
    return this.http.get<NoteLabel[]>(this.baseApiUrl + '/noteLabels');
  }

  updateNote(noteId: number, note: Note) {
    return this.http.put(this.baseApiUrl + `/notes/${noteId}`, note);
  }
}
