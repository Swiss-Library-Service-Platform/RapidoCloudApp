export class UserInformation {
    primary_id: string;
    email: string;
    note: string;
    borrowing_institution: string;

    constructor(init?: Partial<UserInformation>) {
        Object.assign(this, init);
    }
}
