import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal } from '@angular/core';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';

enum tagNames {
  'INPUT'= 'input',
  'TEXT_ARIA' = 'text-aria',
  'SELECT' = 'select',
}

const tagName = new Map([
  ['app-input', 'input'],
  ['app-text-aria','text-aria'],
  ['app-select', 'select'],
])

@Component({
  selector: 'app-input, app-text-aria, app-select',
  imports: [
    MatFormField,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatError,
    MatLabel,
    CdkTextareaAutosize,
    TextFieldModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  control = input.required<FormControl>();
  label = input.required<string>();
  type = input.required<string>();
  placeholder = input<string>('');
  errorMessage = input<string>('');
  errorName = input<string>('');
  isMultiple= input<boolean>(false);
  options = input<string[]>([]);

  elementRef = inject(ElementRef);
  tagName = signal<string>(<string>tagName.get(this.elementRef.nativeElement.localName));

  tagNames = tagNames;
}
