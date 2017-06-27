import {FFCore} from '../app/index';

console.log('Running index ', __filename);
const config = require('../../config/database');

FFCore.configure({
	database: config
});
