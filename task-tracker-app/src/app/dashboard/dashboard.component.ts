import { Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { DashboardService } from './dashboard.service';
import { Observable, Subscription, zip } from 'rxjs';
import { Note, NoteLabel, FilterOption } from './dashboard';
import { NoteDialogComponent } from './note-dialog/note-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  /** Based on the screen size, switch from standard to one column per row */
  filterOptions: FilterOption[] = [
    { id: 0, text: 'All'}
  ];
  notes$: Observable<{notes: Note[]}>;
  noteLabels$: Observable<NoteLabel[]>;
  sub: Subscription = new Subscription();
  weekDays: any = [];
  noteLabels: NoteLabel[] = [];
  formattedNotesMap: any = {};
  filterControl = new FormControl(this.filterOptions[0].id);

  constructor(
    private dashboardService: DashboardService,
    public dialog: MatDialog) {
    this.notes$ = this.dashboardService.getNotes();
    this.noteLabels$ = this.dashboardService.getNoteLabels();
  }

  ngOnInit(): void {
    this.sub = zip(this.notes$, this.noteLabels$).subscribe(([notes, noteLabels]) => {
      console.log(notes, noteLabels);
      this.noteLabels = noteLabels;
      this.filterOptions = [...this.filterOptions, ...this.noteLabels];
      this.formatNotes(notes.notes, noteLabels);
    });
  }

  formatNotes(notes: Note[], noteLabels: NoteLabel[]) {
    let notesWithLabel: any = {};
    let minDate = 100000000000;
    // notesWithLabel = notes.reduce((acc, note) => {
    //   note.labels
    //   return acc;
    // }, {});

    notes.forEach(note => {
      if (minDate > note.startDate) minDate = note.startDate;
      let noteObj: any = {...note};
      noteObj.duration = (new Date(note.endDate).getUTCDate() - new Date(note.startDate).getUTCDate() + 1);
      noteObj.formattedDate = new Date(note.startDate).getUTCDate() + '.' + (new Date(note.startDate).getUTCMonth() + 1);
      noteLabels.forEach(label => {
        if (noteObj.labels.indexOf(label.id) > -1) {
          if (notesWithLabel[label.text]) {
            notesWithLabel[label.text].notes.push(noteObj);
          } else {
            notesWithLabel[label.text] = {notes: [noteObj]};
          }
        }
      });
    });
    console.log(notesWithLabel);
    this.generateWeekDays(minDate);
    // Filter notes as DD.MM labels array
    Object.keys(notesWithLabel).forEach(key => {
      notesWithLabel[key].notes.forEach((note: any) => {
        if (notesWithLabel[key][note.formattedDate]) {
          notesWithLabel[key][note.formattedDate].push(note);
        } else {
          notesWithLabel[key][note.formattedDate] = [note];
        }
      });
    });
    console.log(notesWithLabel);
    this.formattedNotesMap = notesWithLabel;
  }

  generateWeekDays(minDate: any) {
    let date = new Date(minDate);
    this.weekDays = new Array(5).fill(0).map(() => {
      let dd_mm_label = date.getUTCDate() + '.' + (date.getUTCMonth() + 1);
      date = this.addDays(1, date);
      return dd_mm_label;
    });
    console.log(this.weekDays);
  }

  addDays = (num: number, date: Date) => {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + num);
    return d;
  }

  openDialog(note: Note) {
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      data: {
        noteInfo: note
      },
      width: '500px'
    });
    dialogRef.afterClosed().subscribe((updatedNote : Note) => {
      console.log('The dialog was closed', updatedNote);
      this.updateNotes(updatedNote);
    });
  }

  updateNotes(updatedNote: Note) {
    // TODO: Update the notes
  }

  onFilterChange() {
    // TODO: Update the notes
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
