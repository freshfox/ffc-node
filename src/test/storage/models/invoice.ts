import {BaseRepository, belongsToMany, entity, hasMany} from '../../../app';
import {injectable} from 'inversify';

export class BaseModel<T = BaseModel<any>> {
	id?: number;

	constructor(data?) {
		if (data) {
			Object.assign(this, data);
		}
	}
}

@entity('invoice_line_comments')
export class InvoiceLineComment extends BaseModel {
	text: string;
}

@entity('invoice_lines')
export class InvoiceLine extends BaseModel {
	order: number;
	description: string;

	@hasMany('invoice_line_comments', {
		loadEager: true
	}) comments?: InvoiceLineComment[];

}

@entity('payments')
export class Payment extends BaseModel {
	amount?: number;
}

@entity('invoices', ['invoice_lines.comments'])
export class Invoice extends BaseModel {
	@hasMany('invoice_lines', {
		loadEager: true,
		order: {direction: 'asc', column: 'order'}
	}) invoice_lines: InvoiceLine[];
	@belongsToMany('payments', {
		loadEager: true,
		dependent: true,
		order: { column: 'amount', direction: 'asc'}
	}) payments?: Payment[];
}

@injectable()
export class InvoiceRepository extends BaseRepository<Invoice> {

	constructor() {
		super();
		this.model = Invoice;
	}

}

@injectable()
export class PaymentRepository extends BaseRepository<Payment> {

	constructor() {
		super();
		this.model = Payment;
	}

}
