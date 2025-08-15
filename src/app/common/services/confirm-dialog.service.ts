import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {ConfirmDialogComponent, ConfirmDialogData} from "../components/confirm-dialog/confirm-dialog.component";

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  constructor(private dialog: MatDialog) {}

  openConfirmDialog(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data
    }).afterClosed();
  }
}
