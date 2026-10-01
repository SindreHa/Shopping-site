import { HttpErrorResponse } from '@angular/common/http';

interface ApiErrorBody {
    message?: unknown;
    issues?: { path: string; message: string }[];
}

export const describeHttpError = (error: unknown): string => {
    if (!(error instanceof HttpErrorResponse)) {
        return 'Something went wrong';
    }
    if (error.status === 0) {
        return 'Could not reach the server';
    }

    const body = error.error as ApiErrorBody | null;
    if (typeof body?.message !== 'string') {
        return `Request failed (${error.status})`;
    }
    if (!body.issues?.length) {
        return body.message;
    }
    return `${body.message}: ${body.issues.map(issue => `${issue.path} ${issue.message}`).join(', ')}`;
};
