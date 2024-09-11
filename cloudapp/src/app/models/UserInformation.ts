export class UserInformation {
    primary_id: string;
    email: string;

    constructor(init?: Partial<UserInformation>) {
        Object.assign(this, init);
    }
}
