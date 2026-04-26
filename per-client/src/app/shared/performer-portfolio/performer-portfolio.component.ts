import { Component, inject, OnInit, signal } from '@angular/core';
import { PER_API_URL, PerformersService } from '../services/performers.service';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { defer, iif, of, switchMap, take, tap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { CdnPipe } from '../cdn.pipe';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SnackBarService } from '../services/snack-bar.service';
import { AuthService } from '../services/auth.service';
import { INewImage, INewImageOrder, IOldImage } from '../types';
import { containsNonLatin, isNewImage } from '../services/helpers';

@Component({
    selector: 'app-performer-portfolio',
    templateUrl: './performer-portfolio.component.html',
    imports: [
        CdkDropList, CdkDrag, MatButtonModule, CdnPipe,
         MatProgressSpinner,
    ],
    providers: [
        { provide: PER_API_URL, useFactory: (() => {
                const route = inject(ActivatedRoute);
                return route.snapshot.params['id'] ? '/admin/performers' : '/performer';
            }) },
        PerformersService,
    ],
    styleUrl: './performer-portfolio.component.scss'
})
export class PerformerPortfolioComponent implements OnInit {
  private performerService = inject(PerformersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBarService = inject(SnackBarService);
  private authService = inject(AuthService);
  imgArr: (INewImage | IOldImage)[] = [];
  oldImageArr: IOldImage[] = [];
  performerId!: number;
  disableButton= signal<boolean>(false);
  IMAGE_QUANTITY = 25;
  imageCounter = this.IMAGE_QUANTITY;
  addButtonName = 'Add image';
  redirectTo!: string;

  ngOnInit(): void {
    if(this.route.snapshot.params['id']) {
      this.performerId = this.route.snapshot.params['id'];
      this.redirectTo = '/admin/performers';
    } else {
      this.performerId = this.authService.getPerformer().id;
      this.redirectTo = 'performer';
    }

    this.performerService.getPortfolio$(this.performerId)
      .pipe(
      take(1),
    ).subscribe((portfolio) => {
      this.oldImageArr = [...portfolio];
      this.imgArr = [...portfolio];
    })
  }

  selectFiles(event: any): void {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/bmp", "image/webp"];
    const files: FileList = event.target.files;

    Array.from(files).forEach((file: File) => {
      if(allowedMimeTypes.includes(file.type)) {
        const imgFile: INewImage =  {
            file: file,
            order: this.imgArr.length + 1,
            path: ''
        }

          const reader = new FileReader();
          reader.onload = (e: any) => imgFile.path = e.target.result;
          reader.readAsDataURL(file);
          this.imgArr.push(imgFile);
          this.imageCounter--;
        }
      }
    );
  }

  uploadNewImage(newFiles: INewImage[]) {
    const formData = new FormData();

    newFiles.forEach((img) => {
      const imageFile = img as INewImage;
      formData.append('images', imageFile.file, imageFile.file.name);
      formData.append('order', JSON.stringify([imageFile.file.name, imageFile.order]));
    });

    return this.performerService.uploadPortfolio$(formData, this.performerId);
  }

  isChangedImageOrder(newImageOrderArr: INewImageOrder[]) {
    return !newImageOrderArr.every((e, index) => e.order === this.oldImageArr[index].order)
  }

  changeImageOrder$() {
      const newImageOrderArr = this.getImgOrderArr();

      if(this.isChangedImageOrder(newImageOrderArr)) {
        return this.performerService.changeImageOrder$(newImageOrderArr, this.performerId)
      } else {
        return of(false)
      }
  }

  upload() {
    if(this.imageCounter < 0) {
      return
    }

    const newFiles: INewImage[] = this.imgArr.filter(isNewImage);

    if(newFiles.some(({file: { name }}) => containsNonLatin(name))) {
      this.snackBarService.openSnackBar('All file names must be in Latin letters.', 'error')
      return;
    }

    of(Boolean(newFiles.length))
      .pipe(
        tap(() => this.disableButton.set(true)),
        switchMap((isNewFile) =>
          iif(() => isNewFile,
            defer(() => this.uploadNewImage(newFiles as INewImage[]))
              .pipe(switchMap(() => this.changeImageOrder$())),

            defer(() => this.changeImageOrder$())
          )
        ),
        tap((isChanged) => {
          if(!isChanged && !newFiles.length) {
            this.snackBarService.openSnackBar(
              'Edit portfolio: No changes detected.',
              'notification'
            )
          }
        }),
        take(1),
    ).subscribe({
      next: () => this.router.navigate([this.redirectTo]),
    });
  }

  getImgOrderArr(): INewImageOrder[] {
    return this.imgArr
      .filter((img: INewImage | IOldImage): img is IOldImage => 'id' in img && Boolean(img.id))
      .map((img) => ({
        order: img.order,
        id: img.id,
        performerId: img.performerId,
      }));
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.imgArr, event.previousIndex, event.currentIndex);

    this.imgArr.forEach((img, index) => img.order = index);
  }

  isThumbnail(img: INewImage | IOldImage): img is IOldImage {
    return (img as IOldImage).thumbH !== undefined && (img as IOldImage).thumbW !== undefined;
  }

  deleteImage(img: INewImage | IOldImage) {
    if(!this.isThumbnail(img)) {
      this.imageCounter++;

      if(this.imageCounter >= this.IMAGE_QUANTITY) {
        this.imageCounter = this.IMAGE_QUANTITY;
      }
    }

    this.imgArr = [...this.imgArr.filter(item =>
      item.order !== img.order)]

    if(!this.isThumbnail(img)) return;

    this.performerService.deleteImage$(img.performerId, img.id)
      .pipe(take(1))
      .subscribe()
  }
}
