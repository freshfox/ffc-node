import * as should from 'should';
import * as express from 'express';
import {TestCase} from '../../app/test_case';
import {Server} from '../../app/http/server';

describe('Server', function() {

	class TestServer extends Server {

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

	TestCase.server = new TestServer();
	TestCase.defaultOptions = {
		headers: {
			Authorization: 'Bearer tokenasdf'
		}
	};
	TestCase.init(this, true, false);

	it('should send a simple request with default options', () => {

		return TestCase.get('/')
			.then((res) => {
				should(res.request.header.Authorization).eql('Bearer tokenasdf');
				should(res.text).eql('works');
			})

	});

	it('should send a simple request with options', () => {

		return TestCase.get('/', {
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
		TestCase.defaultOptions = null;
		return TestCase.post('/', {})
			.then((res) => {
				should(res.text).eql('post works');
			})

	});

});
