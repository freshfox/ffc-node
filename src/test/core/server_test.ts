import * as should from 'should';
import * as express from 'express';
import {TestCase} from '../../app/test_case';
import {Server} from '../../app/http/server';
import {Container} from 'inversify';
import {KnexConfig} from '../../../dist/app/storage/mysql_driver';
import {StorageDriver} from '../../app/core/storage_driver';
import {TYPES} from '../../app/index';
import {MySQLDriver} from '../../app/storage/mysql_driver';

describe('Server', function() {

	class TestServer extends Server {

		getContainer(): Container {
			let container = new Container();
			container.bind<KnexConfig>(TYPES.KnexConfig).toConstantValue(require('../../../config/database'));
			container.bind<StorageDriver>(TYPES.StorageDriver).to(MySQLDriver).inSingletonScope();
			return container;
		}

		constructor() {
			super(express(), 3002)
		}

		configure() {
			this.app.get('/', (req, res) => {
				res.send('works');
			});
			this.app.post('/', (req, res) => {
				res.send('post works');
			});
		}
	}

	const testCase = TestCase.create(this, new TestServer(), {
		headers: {
			Authorization: 'Bearer tokenasdf'
		}
	});

	it('should send a simple request with default options', () => {

		return testCase.get('/')
			.then((res) => {
				should(res.request.header.Authorization).eql('Bearer tokenasdf');
				should(res.text).eql('works');
			})

	});

	it('should send a simple request with options', () => {

		return testCase.get('/', {
			headers: {
				Authorization: 'Bearer custom'
			}
		})
			.then((res) => {
				should(res.request.header.Authorization).eql('Bearer custom');
				should(res.text).eql('works');
			})

	});

	it('should send a simple post request without options', () => {
		return testCase.post('/', {}, {
			headers: {}
		})
			.then((res) => {
				should(res.text).eql('post works');
			})

	});

});
