import {
  Component,
  ElementRef,
  ViewChild,
  forwardRef,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SignaturePadComponent),
      multi: true
    }
  ]
})
export class SignaturePadComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @ViewChild('signatureCanvas', {static: true}) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() control!: FormControl;
  @Input() disabled = false;
  @Input() width = 900;
  @Input() height = 200;
  @Input() strokeColor = '#000000';
  @Input() strokeWidth = 2;
  @Input() placeholder = 'Sign with your mouse or finger';

  @Output() signatureChanged = new EventEmitter<string | null>();
  @Output() signatureCleared = new EventEmitter<void>();
  @Output() drawingStarted = new EventEmitter<void>();
  @Output() drawingEnded = new EventEmitter<void>();

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private resizeObserver?: ResizeObserver;

  isEmpty = true;
  value: string | null = null;

  private onChange = (value: string | null) => {
  };
  private onTouched = () => {
  };

  ngOnInit() {
    this.setupCanvas();
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private setupCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    canvas.width = this.width;
    canvas.height = this.height;

    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.lineWidth = this.strokeWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  private setupResizeObserver() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.adjustCanvasSize();
      });
      this.resizeObserver.observe(this.canvasRef.nativeElement.parentElement!);
    }
  }

  private adjustCanvasSize() {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      const newWidth = Math.min(this.width, rect.width - 20);
      if (newWidth !== canvas.width) {
        canvas.style.width = `${newWidth}px`;
      }
    }
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    if (this.disabled) return;

    this.isDrawing = true;
    const coords = this.getCoordinates(event);
    this.lastX = coords.x;
    this.lastY = coords.y;

    this.onTouched();
    this.drawingStarted.emit();

    if (event instanceof TouchEvent) {
      event.preventDefault();
    }
  }

  draw(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing || this.disabled) return;

    const coords = this.getCoordinates(event);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();

    this.lastX = coords.x;
    this.lastY = coords.y;

    this.updateValue();

    if (event instanceof TouchEvent) {
      event.preventDefault();
    }
  }

  stopDrawing(event?: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;

    this.isDrawing = false;
    this.drawingEnded.emit();

    if (event instanceof TouchEvent) {
      event.preventDefault();
    }
  }

  clearSignature() {
    if (this.disabled) return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.updateValue();
    this.signatureCleared.emit();
  }

  private getCoordinates(event: MouseEvent | TouchEvent): { x: number, y: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (event instanceof MouseEvent) {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      };
    } else {
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    }
  }

  private updateValue() {
    const canvas = this.canvasRef.nativeElement;
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    this.isEmpty = this.isCanvasEmpty(data);

    if (this.isEmpty) {
      this.value = null;
    } else {
      this.value = canvas.toDataURL('image/png');
    }

    this.onChange(this.value);
    this.signatureChanged.emit(this.value);
  }

  private isCanvasEmpty(imageData: Uint8ClampedArray): boolean {

    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];


      if (a > 0 && (r !== 255 || g !== 255 || b !== 255)) {
        return false;
      }
    }
    return true;
  }

  private cleanup() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  writeValue(value: string): void {
    this.value = value || '';
    this.isEmpty = !this.value;

    if (this.value && this.ctx) {
      const img = new Image();
      img.onload = () => {
        this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

        this.ctx.drawImage(img, 0, 0);
      };
      img.src = this.value;
    } else if (this.ctx) {
      this.clearSignature();
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get hasError(): boolean {
    return this.control.invalid && (this.control.touched || this.control.dirty);
  }

  getErrorMessage(): string {
    if(!this.control.errors) return '';
    return 'signature is required';
  }
}
