export class UserInformation {
    primary_id: string;

    constructor(init?: Partial<UserInformation>) {
        Object.assign(this, init);
    }
}
