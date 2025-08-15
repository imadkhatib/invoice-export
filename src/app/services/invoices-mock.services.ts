import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {delay, map} from 'rxjs/operators';
import {InvoiceApiResponse, InvoiceApiRequest, InvoiceSubmissionResult} from "../interfaces/invoice.interface";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class InvoicesMockService {
  private readonly serviceUrl = "invoices";

  constructor(private httpClient: HttpClient) {
  }

  submitInvoice(request: InvoiceApiRequest): Observable<InvoiceSubmissionResult> {
    if (environment.mock) {
      return this.mockSubmitInvoice(request);
    } else {

      return this.httpClient.post<InvoiceApiResponse>(`${environment.baseApiUrl}${this.serviceUrl}/submitInvoice`, request).pipe(
        map((response: InvoiceApiResponse) => this.mapToSubmissionResult(response)),
      );
    }
  }

  private mockSubmitInvoice(request: InvoiceApiRequest): Observable<InvoiceSubmissionResult> {
    const mockResponse: InvoiceApiResponse = {
      success: true,
      message: 'Invoice submitted successfully',
      data: {
        id: this.generateMockedInvoiceId(),
        submittedAt: new Date().toISOString()
      }
    };

    return of(mockResponse).pipe(
      delay(1500),
      map(response => this.mapToSubmissionResult(response))
    );
  }

  private mapToSubmissionResult(response: InvoiceApiResponse): InvoiceSubmissionResult {
    return {
      success: response.success,
      message: response.message,
      invoiceId: response.data?.id
    };
  }

  private generateMockedInvoiceId(): string {
    return 'INVOICE-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}
