import {createDatabaseTest} from '../index';
import {Invoice, InvoiceRepository} from './models/invoice';
import * as should from 'should';

describe('Nested Models', function () {

	const container = createDatabaseTest(this);
	const invoiceRepo = container.resolve(InvoiceRepository);

	it('should save a nested model', async () => {

		const invoice: Invoice = new Invoice({
			invoice_lines: [{
				description: 'D1',
				comments: [{
					text: 'C1'
				}, {
					text: 'C2'
				}]
			}]
		});
		const saved1 = await invoiceRepo.save(invoice);
		saved1.invoice_lines[0].comments.splice(1, 1);

		const saved2 = await invoiceRepo.save(saved1);
		console.log(saved2);

	});

	it('should ', async () => {

	});

});
