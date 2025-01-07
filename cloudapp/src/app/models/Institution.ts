export class Institution {
    id: string;
    full_name: string;
    abbreviation: string;
    short_code: string;

    constructor(init?: Partial<Institution>) {
        Object.assign(this, init);
    }
}
