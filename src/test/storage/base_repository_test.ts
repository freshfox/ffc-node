import {BaseRepository} from '../../app';
import * as should from 'should';
import {InvoiceRepository, Payment, PaymentRepository} from './models/invoice';
import {createDatabaseTest} from '../index';

describe('BaseRepository', function () {

	const container = createDatabaseTest(this);

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
