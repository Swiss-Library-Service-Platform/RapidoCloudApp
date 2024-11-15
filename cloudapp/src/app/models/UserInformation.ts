export class UserInformation {
    primary_id: string;
    email: string;
    note: string;

    constructor(init?: Partial<UserInformation>) {
        Object.assign(this, init);
    }
}
