import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from './core/components/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [NavbarComponent, RouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
