
export interface Order {

	column: string;
	direction: OrderDirection;

}

export enum OrderDirection {

	ASC = 'asc' as any,
	DESC = 'desc' as any

}
