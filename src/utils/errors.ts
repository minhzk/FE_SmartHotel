import { AuthError } from 'next-auth';

export class CustomAuthError extends AuthError {
    constructor(message?: any) {
        super();

        this.name = message;
    }
}

export class InvalidEmailPasswordError extends AuthError {
    constructor() {
        super('Email/Password is invalid');
        this.name = 'InvalidEmailPasswordError';
    }
}

export class InactiveAccountError extends AuthError {
    constructor() {
        super('Account is inactive');
        this.name = 'InactiveAccountError';
    }
}
