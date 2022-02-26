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
  noteLabelsCopy: NoteLabel[] = [];
  calenderWeek = 1;
  weekShiftCounter = 1;
  startDate = 0;

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
      this.noteLabelsCopy = [...noteLabels];
      this.formatNotes(notes.notes, noteLabels);
    });
  }

  formatNotes(notes: Note[], noteLabels: NoteLabel[]) {
    let notesWithLabel: any = {};
    let minDate = 1000000000000000;

    notes.forEach(note => {
      note.startDate = note.startDate * 1000;
      note.endDate = note.endDate * 1000;
      if (minDate > note.startDate) minDate = note.startDate;
      this.startDate = minDate;
      this.calenderWeek = this.getWeekNumber(new Date(minDate));
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
      if (updatedNote) {
        this.updateNotes(updatedNote);
      }
    });
  }

  updateNotes(updatedNote: Note) {
    let tempNotesMap = {...this.formattedNotesMap};
    const dateLabel = updatedNote.formattedDate;
    updatedNote.labels.forEach((labelId) => {
      const labelObj = this.noteLabels.find((labelObj) => labelObj.id === labelId);
      if (labelObj && dateLabel) {
        const labelName = labelObj.text;
        const index = tempNotesMap[labelName][dateLabel].findIndex((noteItem: Note) => noteItem.id === +updatedNote.id);
        tempNotesMap[labelName][dateLabel][index] = updatedNote;
      }
    });
    this.formattedNotesMap = {...tempNotesMap};
  }

  onFilterChange() {
    setTimeout(() => {
      const filterId = this.filterControl.value;
      const filterOption = this.noteLabelsCopy.find((option) => option.id === filterId);
      console.log(filterOption);
      if(filterOption && filterOption.text !== this.filterOptions[0].text) {
        this.noteLabels = [filterOption];
      } else {
        this.noteLabels = [...this.noteLabelsCopy];
      }
    });
  }

  shiftLeftTasks() {
    this.weekShiftCounter--;
    this.generateWeekDays(this.addDays(7 * (this.weekShiftCounter-1), new Date(this.startDate)));
  }

  shiftRightTasks() {
    this.generateWeekDays(this.addDays(7 * this.weekShiftCounter, new Date(this.startDate)));
    this.weekShiftCounter++;
  }

  getWeekNumber(date: any) {
    let onejan: any = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  };

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
