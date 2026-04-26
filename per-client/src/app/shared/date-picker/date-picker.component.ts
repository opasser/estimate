import { Component } from '@angular/core';
import {
  MatDatepickerModule,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatInput, MatSuffix } from '@angular/material/input';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { InputComponent } from '../input/input.component';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  imports: [
    MatFormField,
    MatSuffix,
    MatDatepickerToggle,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatFormField,
    MatDatepickerModule,
    MatInput,
    ReactiveFormsModule,
  ],
  providers: [MatDatepickerModule],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss'
})
export class DatePickerComponent extends InputComponent {}
