import { Component } from '@angular/core';
import { templatePaths } from '../../../pre-build/template.env';

@Component({
    selector: 'app-inc-logo',
    templateUrl: templatePaths.logo.templateUrl,
    styleUrl: templatePaths.logo.styleUrl
})
export class LogoComponent {}
