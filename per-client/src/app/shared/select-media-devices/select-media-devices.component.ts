import { Component, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IInputDeviceInfo } from '../types';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-select-media-devices',
  imports: [MatSelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './select-media-devices.component.html',
  styleUrl: './select-media-devices.component.scss'
})
export class SelectMediaDevicesComponent {
  videoDeviceForm = input.required<FormControl<any>>();
  audioDeviceForm = input.required<FormControl<any>>();
  audioDevices = input.required<IInputDeviceInfo[]>();
  videoDevices = input.required<IInputDeviceInfo[]>();
}
