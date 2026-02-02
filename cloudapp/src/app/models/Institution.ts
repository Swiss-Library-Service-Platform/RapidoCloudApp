export class Institution {
    full_name: string;
    iz_abbreviation: string;
    short_code: string;

    constructor(init?: Partial<Institution>) {
        Object.assign(this, init);
    }
}
