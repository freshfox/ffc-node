"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const should = require("should");
const express = require("express");
const server_1 = require("../../app/server");
const test_case_1 = require("../../app/test_case");
describe('Server', function () {
    class TestServer extends server_1.Server {
        constructor() {
            super(express(), 3002);
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
    test_case_1.TestCase.server = new TestServer();
    test_case_1.TestCase.defaultOptions = {
        headers: {
            Authorization: 'Bearer tokenasdf'
        }
    };
    test_case_1.TestCase.init(this, true, false);
    it('should send a simple request with default options', () => {
        return test_case_1.TestCase.get('/')
            .then((res) => {
            should(res.request.header.Authorization).eql('Bearer tokenasdf');
            should(res.text).eql('works');
        });
    });
    it('should send a simple request with options', () => {
        return test_case_1.TestCase.get('/', {
            headers: {
                Authorization: 'Bearer custom'
            }
        })
            .then((res) => {
            should(res.request.header.Authorization).eql('Bearer custom');
            should(res.text).eql('works');
        });
    });
    it('should send a simple post request without options', () => {
        test_case_1.TestCase.defaultOptions = null;
        return test_case_1.TestCase.post('/', {})
            .then((res) => {
            should(res.text).eql('post works');
        });
    });
});
//# sourceMappingURL=server_test.js.map