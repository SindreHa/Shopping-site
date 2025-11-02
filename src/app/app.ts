import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/components/navbar';

@Component({
    selector: 'app-root',
    imports: [NavbarComponent, RouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {}
