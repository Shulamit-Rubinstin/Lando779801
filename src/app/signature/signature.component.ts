import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { SignaturePadModule } from 'ngx-signaturepad';

@Component({
  selector: 'app-signature',
  standalone: true,
  imports: [SignaturePadModule],
  templateUrl: './signature.component.html',
  styleUrl: './signature.component.css'
})
export class SignatureComponent implements AfterViewInit {

  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  private context!: CanvasRenderingContext2D;
  private isDrawing = false;

  ngAfterViewInit() {
    const canvas = this.canvasElement.nativeElement;
    this.context = canvas.getContext('2d')!;
    this.context.lineWidth = 2;
    this.context.strokeStyle = 'black'; 

    // הוספת מאזינים עבור עכבר
    canvas.addEventListener('mousedown', (event) => this.startDrawing(event));
    canvas.addEventListener('mouseup', () => this.stopDrawing());
    canvas.addEventListener('mousemove', (event) => this.draw(event));

    // הוספת מאזינים עבור מסך מגע
    canvas.addEventListener('touchstart', (event) => this.startDrawing(event as unknown as MouseEvent));
    canvas.addEventListener('touchend', () => this.stopDrawing());
    canvas.addEventListener('touchmove', (event) => this.draw(event as unknown as MouseEvent));
  }

  private startDrawing(event: MouseEvent | TouchEvent) {
    this.isDrawing = true;
    this.context.beginPath();
    const { x, y } = this.getCoords(event);
    this.context.moveTo(x, y);
  }

  private stopDrawing() {
    this.isDrawing = false;
    this.context.closePath();
  }

  private draw(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
    const { x, y } = this.getCoords(event);
    this.context.lineTo(x, y);
    this.context.stroke();
  }

  private getCoords(event: MouseEvent | TouchEvent) {
    const canvas = this.canvasElement.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = (event instanceof MouseEvent ? event.clientX : event.touches[0].clientX) - rect.left;
    const y = (event instanceof MouseEvent ? event.clientY : event.touches[0].clientY) - rect.top;
    return { x, y };
  }

  clearCanvas() {
    const canvas = this.canvasElement.nativeElement;
    this.context.clearRect(0, 0, canvas.width, canvas.height);
  }

  saveSignature() {
    const canvas = this.canvasElement.nativeElement;
    const dataURL = canvas.toDataURL();
    window.alert('Signature saved and displayed on screen');
    // Open a new window to display the image
    const newWindow = window.open("", "", "width=600,height=400");
    if (newWindow) {
      newWindow.document.write(`<img src="${dataURL}" alt="Signature" style="width: 100%; height: auto;"/>`);
      newWindow.document.close();
    }
  }
}

