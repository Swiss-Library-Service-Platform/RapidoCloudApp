import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterByType'
})
export class FilterByTypePipe implements PipeTransform {
    transform(entities: any[], type: string): any[] {
        return entities.filter(entity => entity.type === type);
    }
}
