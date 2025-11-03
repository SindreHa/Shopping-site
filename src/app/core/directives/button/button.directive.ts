import { computed, Directive, input } from '@angular/core';

enum ButtonVariantEnum {
    PROMINENT = 'PROMINENT',
    SUBTLE = 'SUBTLE',
    DESTRUCTIVE = 'DESTRUCTIVE',
}

const ButtonVariants: Record<keyof typeof ButtonVariantEnum, string> = {
    [ButtonVariantEnum.PROMINENT]: 'bg-blue-700 text-white hover:bg-blue-600',
    [ButtonVariantEnum.SUBTLE]: 'bg-transparent text-blue-600 hover:bg-blue-600 hover:text-white',
    [ButtonVariantEnum.DESTRUCTIVE]: 'bg-red-700 text-white hover:bg-red-600',
};

@Directive({
    selector: 'button[appCommonButton]',
    host: {
        '[class]': 'classes$()',
    },
})
export class CommonButtonDirective {
    public variant = input<keyof typeof ButtonVariantEnum>(ButtonVariantEnum.PROMINENT);

    public disabledClass = 'disabled:cursor-default disabled:bg-gray-200 disabled:text-gray-500';
    public baseClasses = `px-4 py-2 cursor-pointer rounded font-semibold transition ${this.disabledClass}`;

    public classes$ = computed(() => {
        return `${this.baseClasses} ${ButtonVariants[this.variant()]}`;
    });
}
