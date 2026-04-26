import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IBanner, IBannerForm } from '../../shared/types';
import { ActivatedRoute, Router } from '@angular/router';
import { BannerTableService } from '../service/banner-table.service';
import { SnackBarService } from '../../shared/services/snack-bar.service';
import { AvatarComponent } from '../../avatar/avatar.component';
import { InputComponent } from '../../shared/input/input.component';
import { isDataUpdate } from '../../shared/services/helpers';
import { filter, finalize, map, of, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-banner-info',
  imports: [
    AvatarComponent,
    InputComponent,
    ReactiveFormsModule
  ],
  providers: [BannerTableService],
  templateUrl: './banner-info.component.html',
  styleUrl: './banner-info.component.scss'
})
export class BannerInfoComponent implements OnInit {
  title= '';
  form!: FormGroup<IBannerForm>;
  bannerPath!: string;
  banner!: IBanner;
  private selectedFile!: FormData;
  private isBannerEdit: boolean = false;
  private route = inject(ActivatedRoute);
  bannerService = inject(BannerTableService);
  private router = inject(Router);
  private snackBarService = inject(SnackBarService);
  disable = signal<boolean>(false);

  constructor() {
    this.form = new FormGroup<IBannerForm>({
      scope: new FormControl(this.banner?.scope, [ Validators.required]),
      section: new FormControl(this.banner?.section, [ Validators.required]),
      url: new FormControl(this.banner?.url, [ Validators.required]),
      alt: new FormControl(this.banner?.url, [ Validators.required]),
      locale: new FormControl(this.banner?.locale, [ Validators.required])
    });
  }

  ngOnInit() {
    this.route.url
      .pipe(
        map((segments) => {
          this.isBannerEdit = segments.some(segment => segment.path === 'edit');
          this.title = this.isBannerEdit ? 'Edit Banner' : 'Add Banner';

          return this.isBannerEdit;
        }),
        filter(Boolean),
        switchMap(() => this.route.params),
        switchMap(({id}) => this.bannerService.getItemById$(Number(id))),
        take(1)
      ).subscribe(banner => {
        this.banner = banner;
        this.bannerPath = banner.imgPath;
        this.updateForm();
    });
  }

  private updateForm() {
    this.form.patchValue({...this.banner});
  }

  get scope() {
    return this.form.controls['scope'];
  }

  get section() {
    return this.form.controls['section'];
  }

  get url() {
    return this.form.controls['url'];
  }

  get alt() {
    return this.form.controls['alt'];
  }

  get locale() {
    return this.form.controls['locale'];
  }

  setFile(formData: FormData) {
    this.selectedFile = formData;
  }

  onSubmit() {
    if (this.form.invalid)  {
      for (const key in this.form.controls) {
        if (!this.form.get(key)?.dirty) {
          this.form.get(key)?.markAsTouched();
        }
      }

      return
    }

    this.disable.set(true);

    const newBannerData = {
      ...this.banner,
      ...this.form.value,
    };

    const isUpdate = isDataUpdate(newBannerData, this.banner);
    const method$ = isUpdate
      ? this.isBannerEdit
        ? this.bannerService.editItem$(newBannerData)
        : this.bannerService.submitItem$(newBannerData)
      : of({ id: newBannerData.id });

    method$
      .pipe(
        switchMap(res =>
          this.selectedFile
            ? this.bannerService.uploadImage$(this.selectedFile, res.id)
            : of(res)
        ),
        finalize(() => {
          if (!isUpdate && !this.selectedFile) {
            this.snackBarService.openSnackBar(
              'Edit banner: No changes detected.',
              'notification'
            )
          }
        }),
        take(1),
      )
      .subscribe({
        next: () => this.router.navigate(['admin/banners']),
        error: () => this.disable.set(false),
      });
  }
}
