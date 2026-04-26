import { nanoid } from 'nanoid';
import { IDataPayload, IEvent, INewImage, IOldImage } from '../types';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function getPrivateRoomId(performerId: number) {
  return `room_${performerId}_${nanoid(10)}`;
}

export function getPrivateStreamId(performerId: number, role: string) {
  return `${role[0]}ps_${performerId}_${nanoid(10)}`;
}

export function getStreamId(performerId: number) {
  return `${performerId}_${nanoid(10)}`;
}

export function capFirLet(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function isEvent(obj: any): obj is IEvent {
  return obj && typeof obj === 'object' && 'eventName' in obj;
}

export function isMessages(obj: any): obj is IDataPayload {
  return obj && typeof obj === 'object' && 'type' in obj;
}

export async function checkMediaAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    const cameraAvailable = stream.getVideoTracks().length > 0;
    const microphoneAvailable = stream.getAudioTracks().length > 0;

    stream.getTracks().forEach(track => track.stop());

    return { camera: cameraAvailable, microphone: microphoneAvailable };
  } catch (err) {
    console.error('Media access denied or not available:', err);
    return { camera: false, microphone: false };
  }
}

export function containsNonLatin(text: string): boolean {
  return /[^\x00-\x7F]/.test(text);
}

export function isNewImage(file: INewImage | IOldImage): file is INewImage {
  return 'file' in file && Boolean(file.file);
}

export function areStringsArraysEqual(arr1: string[], arr2: string[]) {
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();

  return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
}

export function isDataUpdate<T extends Record<string, any>>(newData: T, oldData: T): boolean {
  if (!oldData) {
    return true;
  }

  return Object.keys(newData).some((key) => {
    const newVal = newData[key];
    const oldVal = oldData[key];

    if (Array.isArray(newVal) && Array.isArray(oldVal)) {
      const bothStringArrays = newVal.every(v => typeof v === 'string') &&
        oldVal.every(v => typeof v === 'string');

      if (bothStringArrays) {
        return !areStringsArraysEqual(newVal, oldVal);
      }
    }

    return newVal !== oldVal;
  });
}

export function integerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const integerRegex = /^-?\d+$/;

    if (!integerRegex.test(value.toString())) {
      return { invalidInteger: true };
    }

    return null;
  };
}

export function decimalValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const stringValue = value.toString();

    const decimalRegex = /^\d+[,.]\d{2}$/;

    if (!decimalRegex.test(stringValue)) {
      return { invalidDecimal: true };
    }

    return null;
  };
}

export function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < minAge) {
      return { invalidAge: true };
    }
    return null;
  };
}

export function deleteNullValue<T extends object>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== null)
  )
}
