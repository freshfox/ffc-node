import {FFCore} from '../app/index';

const config = require('../../config/database');

FFCore.configure({
	database: config
});
