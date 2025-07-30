import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // הוסף כאן
import { SignatureComponent } from '../signature/signature.component'
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';
import { DateFormatPipe } from '../date-format.pipe';
import { SuccessMessageComponent } from '../success-message/success-message.component';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SignatureComponent, DateFormatPipe, SuccessMessageComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit {
  public updateForm!: FormGroup;
  @ViewChild('formContainer') formContainer!: ElementRef;
  pdfFile: jsPDF | null = null;
  showSuccessMessage = false;
  showErrorMessage = false;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) { }
  ngOnInit(): void {
    this.updateForm = this.fb.group({
      institutionName: ['חבד מעורב נוה שמיר ', [Validators.required]],
      institutionSergeant: ['779801 ', [Validators.required]],
      permission: ['', [Validators.required]],
      fromKosher: ['', [Validators.required]],
      toKosher: ['רבני העיר בני ברק הרב לנדא והרב רוזנבלט', [Validators.required]],
      fullName: ['', [Validators.required]],
      class: ['', [Validators.required]],
      parentsName: ['', [Validators.required]],
      permissionF: [''],
      toKosherF: [''],
      institutionNameF: [''],
      fromKosherF: [''],
      date: [new Date(), [Validators.required]],
    });
  }
  send(): void {
    if (this.updateForm.invalid) {
      this.markFieldsAsTouched();
      this.showErrorMessage = true;
      const missingFields = this.getMissingFields();
      this.showMissingFields(missingFields);
      return;
    }
    this.showErrorMessage = false;
    this.generatePDF();
  }
  getMissingFields(): string[] {
    const missingFields: string[] = [];
    Object.keys(this.updateForm.controls).forEach(field => {
      const control = this.updateForm.get(field);
      if (control?.invalid && control.touched) {
        missingFields.push(this.getFieldLabel(field));
      }
    });
    return missingFields;
  }
  getFieldLabel(fieldName: string): string {
    switch (fieldName) {
      case 'institutionName': return 'שם מוסד';
      case 'institutionSergeant': return 'סמל מוסד';
      case 'permission': return 'רשות';
      case 'fromKosher': return 'מכשרות';
      case 'fullName': return 'שם הילד/ה';
      case 'class': return 'כיתה';
      case 'parentsName': return 'שם ההורה';
      case 'date': return 'תאריך';
      default: return 'שדה לא מזוהה';
    }
  }
  markFieldsAsTouched(): void {
    Object.keys(this.updateForm.controls).forEach(field => {
      const control = this.updateForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
  showMissingFields(missingFields: string[]): void {
    const message = `נא למלא את השדות: ${missingFields.join(', ')}`;
    this.snackBar.open(message, 'סגור', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
  generatePDF(): void {
    console.log("in log")
    const sendButton = document.querySelector('button[type="button"]');
    const pdfWidth = 210; // רוחב PDF במילימטרים (A4)
    const pdfHeight = 297; // גובה PDF במילימטרים (A4)
    const imageQuality = 1.0; // איכות התמונה (1.0 = האיכות הגבוהה ביותר)
    if (sendButton) {
      sendButton.classList.add('hidden'); // הסתרת כפתור השליחה
    }
    const formElement = this.formContainer.nativeElement;

    html2canvas(formElement, {
      scale: 2, // קנה מידה רגיל כדי לשמור על איכות גבוהה
      width: formElement.scrollWidth, // שימוש ברוחב המקורי של האלמנט
      height: formElement.scrollHeight, // שימוש בגובה המקורי של האלמנט
      allowTaint: true // מאפשר טיית תכנים גולמיים
    }).then((canvas: HTMLCanvasElement) => {
      if (sendButton) {
        sendButton.classList.remove('hidden'); // הצגת כפתור השליחה מחדש
      }
      const imgData = canvas.toDataURL('image/jpeg', imageQuality);
      const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
      const imgProps = pdf.getImageProperties(imgData);
      let imgWidth = pdfWidth; // הגדרת משתנים עם ערכים התחלתיים
      let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      // אם התמונה גבוהה מדי, מתאימים לגובה של דף ה-PDF
      if (imgHeight > pdfHeight) {
        imgWidth = (imgProps.width * pdfHeight) / imgProps.height;
        imgHeight = pdfHeight;
      }
      const xOffset = (pdfWidth - imgWidth) / 2; // התאמה במרכז לרוחב
      const yOffset = (pdfHeight - imgHeight) / 2; // התאמה במרכז לגובה
      pdf.addImage(imgData, 'JPEG', xOffset, 0, imgWidth, imgHeight);

      // pdf.save('d.pdf');
      const pdfBlob = pdf.output('blob');
      this.convertBlobToBase64(pdfBlob).then(base64PDF => {
        this.sendEmail(base64PDF);
      });
    });
  }

  public convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  public sendEmail(base64PDF: string) {
    console.log('Sending email...');
    const templateParams = {
      pdfBase64String: base64PDF
    };
    this.showSuccessMessage = true;
    emailjs.send("service_sslvwl8", "template_d7ffwxm", {
      pdf: base64PDF,
    }, 'WYEy2hfn7R_lvrv4e',)
      .then(
        (response) => {
          this.showSuccessMessage = true;
          console.log('SUCCESS!', response.status, response.text, templateParams);
        },
        (error) => {
          console.log('FAILED...', error);
        }
      );
  }
}

