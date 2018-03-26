import {TYPES} from '../../app/core/types';
import {TestCase} from '../../app/test_case';
import {entity, ModelDesc} from '../../app/storage/decorators';
import {KnexConfig, MySQLDriver} from '../../app/storage/mysql_driver';
import {Container, injectable} from 'inversify';
import {StorageDriver} from '../../app/core/storage_driver';
import {BaseRepository, belongsToMany, hasMany} from '../../app';
import * as should from 'should';

@entity('invoice_lines')
class InvoiceLine {
	id?: number;
	order: number;
	description: string;
}

@entity('payments')
class Payment {
	id?: number;
	amount?: number;
}

@entity('invoices')
class Invoice {
	id?: number;
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
class InvoiceRepository extends BaseRepository<Invoice> {

	constructor() {
		super();
		this.model = Invoice;
	}

}

@injectable()
class PaymentRepository extends BaseRepository<Payment> {

	constructor() {
		super();
		this.model = Payment;
	}

}

describe('BaseRepository', function () {


	let container = new Container();
	container.bind<KnexConfig>(TYPES.KnexConfig).toConstantValue(require('../../../config/database'));
	container.bind<StorageDriver>(TYPES.StorageDriver).to(MySQLDriver).inSingletonScope();
	container.bind(InvoiceRepository).toSelf().inSingletonScope();
	container.bind(PaymentRepository).toSelf().inSingletonScope();

	let driver = container.get<StorageDriver>(TYPES.StorageDriver);
	driver.registerEntity(InvoiceLine as ModelDesc);
	driver.registerEntity(Payment as ModelDesc);
	driver.registerEntity(Invoice as ModelDesc);
	TestCase.createDatabaseOnly(this, container);

	const invoiceRepo = container.resolve(InvoiceRepository);
	const paymentRepo = container.resolve(PaymentRepository);

	it('should order one to many relations', async () => {

		const i1 = await invoiceRepo.save({
			invoice_lines: [{
				order: 1,
				description: '1'
			}, {
				order: 3,
				description: '3'
			}, {
				order: 2,
				description: '2'
			}]
		});

		should(i1.invoice_lines[0].order).eql(1);
		should(i1.invoice_lines[1].order).eql(2);
		should(i1.invoice_lines[2].order).eql(3);

	});

	it('should order many to many relations', async () => {

		const p1 = await paymentRepo.save({
			amount: 10
		});

		const p2 = await paymentRepo.save({
			amount: 20
		});

		const p3 = await paymentRepo.save({
			amount: 30
		});

		let i1 = await invoiceRepo.save({
			invoice_lines: []
		});

		await invoiceRepo.associate(Payment, i1.id, p1.id);
		await invoiceRepo.associate(Payment, i1.id, p2.id);
		await invoiceRepo.associate(Payment, i1.id, p3.id);

		i1 = await invoiceRepo.findById(i1.id);

		should(i1.payments[0].id).eql(p1.id);
		should(i1.payments[1].id).eql(p2.id);
		should(i1.payments[2].id).eql(p3.id);

		await paymentRepo.save({
			id: p2.id,
			amount: 40
		});

		i1 = await invoiceRepo.findById(i1.id);

		should(i1.payments[0].id).eql(p1.id);
		should(i1.payments[1].id).eql(p3.id);
		should(i1.payments[2].id).eql(p2.id);

	});


});
