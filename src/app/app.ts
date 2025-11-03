import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from './core/components/navbar/navbar';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [NavbarComponent, RouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {}
