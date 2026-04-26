import { Component, inject, input, Input, output, signal } from '@angular/core';
import { CdnPipe } from '../shared/cdn.pipe';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  providers: [CdnPipe],
})
export class AvatarComponent {
  selectedImageUrl = '';
  cdnPipe = inject(CdnPipe);
  height = input<number | null>(null);
  width = input<number | null>(null);

  @Input() set imageUrl(imageUrl: string) {
    if(imageUrl) {
      this.selectedImageUrl = this.cdnPipe.transform(imageUrl);
    } else {
      this.selectedImageUrl = '';
    }
  }

  setFile = output<FormData>();
  fileError = signal(false);

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if(!file) return;

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/bmp", "image/webp"];

    if (allowedMimeTypes.includes(file.type)) {
      let reader = new FileReader();
      reader.onload = (event: any) => this.selectedImageUrl = event.target.result;
      reader.readAsDataURL(file);
      this.fileError.set(false);
      this.onUploadImage(file);
    } else {
      this.fileError.set(true);
    }
  }

  onUploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file, file.name);
    this.setFile.emit(formData);
  }
}
