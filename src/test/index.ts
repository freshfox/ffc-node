// Load config
import '../../config';
import {Container} from 'inversify';
import {KnexConfig, ModelDesc, MySQLDriver, StorageDriver, TestCase, TYPES} from '../app';
import {
	Invoice,
	InvoiceLine,
	InvoiceLineComment,
	InvoiceRepository,
	Payment,
	PaymentRepository
} from './storage/models/invoice';

export function createDatabaseTest(context) {
	let container = new Container();
	container.bind<KnexConfig>(TYPES.KnexConfig).toConstantValue(require('../../config/database'));
	container.bind<StorageDriver>(TYPES.StorageDriver).to(MySQLDriver).inSingletonScope();
	container.bind(InvoiceRepository).toSelf().inSingletonScope();
	container.bind(PaymentRepository).toSelf().inSingletonScope();

	let driver = container.get<StorageDriver>(TYPES.StorageDriver);
	driver.registerEntity(InvoiceLine as ModelDesc);
	driver.registerEntity(Payment as ModelDesc);
	driver.registerEntity(Invoice as ModelDesc);
	driver.registerEntity(InvoiceLineComment as ModelDesc);
	TestCase.createDatabaseOnly(context, container);
	return container;
}
