import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CommonButtonDirective } from '../../core/directives/button/button.directive';
import { RealtimeService } from '../../core/realtime/realtime.service';

@Component({
    selector: 'app-admin-shell',
    templateUrl: './admin-shell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonButtonDirective],
})
export class AdminShellComponent {
    public username$ = inject(AuthService).username$;
    public isAdminChannel$ = inject(RealtimeService).isAdminChannel$;

    public links = [
        { title: 'Products', url: 'products' },
        { title: 'Orders', url: 'orders' },
    ];
}
