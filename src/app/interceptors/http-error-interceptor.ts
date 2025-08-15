import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import {MatSnackBar} from "@angular/material/snack-bar";


@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router,
              private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let request = req;
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => event),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected error occurred';

        if (error.error instanceof ErrorEvent) {
          errorMessage = 'Network error — please check your internet connection.';
        } else {
          switch (error.status) {
            case 400:
              errorMessage = 'Invalid request. Please check your input and try again.';
              break;
            case 401:
              errorMessage = 'Authentication required. Please log in and try again.';
              break;
            case 403:
              errorMessage = 'Access denied. You do not have permission to perform this action.';
              break;
            case 404:
              errorMessage = 'Service not found. Please contact support.';
              break;
            case 409:
              errorMessage = 'Invoice number already exists. Please use a different number.';
              break;
            case 422:
              errorMessage = 'Validation failed. Please check your input data.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later or contact support.';
              break;
            case 503:
              errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
              break;
          }
        }

          this.snackBar.open(errorMessage, 'Close', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
        return throwError(error.error);
      })
    );
  }
}
