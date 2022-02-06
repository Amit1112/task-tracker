import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Note } from '../dashboard';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-note-dialog',
  templateUrl: './note-dialog.component.html',
  styleUrls: ['./note-dialog.component.scss']
})
export class NoteDialogComponent implements OnInit, OnDestroy {

  noteForm: FormGroup = new FormGroup({});
  updatedNote: Note | undefined;
  subscription: Subscription = new Subscription();

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogNoteData: any,
    private formBuilder: FormBuilder,
    private dashboardService: DashboardService,
    public dialogRef: MatDialogRef<NoteDialogComponent>
    ) {
    }

  ngOnInit(): void {
    this.noteForm = this.formBuilder.group({
      noteTitle: [this.dialogNoteData.noteInfo.title, [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      noteDescription: [this.dialogNoteData.noteInfo.summary, [Validators.required, Validators.maxLength(250)]],
    });
  }

  updateNote() {
    let payload: Note = {
      ...this.dialogNoteData.noteInfo,
      title: this.noteForm.value.noteTitle,
      summary: this.noteForm.value.noteDescription
    };
    const noteId= this.dialogNoteData?.noteInfo?.id;
    this.subscription = this.dashboardService.updateNote(noteId, payload).subscribe((res: any) => {
      this.updateNote = res.noteData;
      this.dialogRef.close(this.updateNote);
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
