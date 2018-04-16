import {inject, injectable} from 'inversify';
import * as nodemailer from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';
import * as stubTransport from 'nodemailer-stub-transport';
import {SendMailOptions, Transporter} from 'nodemailer';
import {SmtpOptions} from 'nodemailer-smtp-transport';
import {WebError} from '../error';

export const MailerConfig = Symbol('IMailerConfig');

@injectable()
export class MailerService {

	private transport: Transporter;

	constructor(@inject(MailerConfig) private config: IMailerConfig) {
		this.transport = this.createTransport(config);
	}

	private createTransport(config: IMailerConfig) {
		if (config.type === MailerType.SMTP) {
			return nodemailer.createTransport(smtpTransport(config.options));

		}
		return this.transport = nodemailer.createTransport(stubTransport());
	}

	sendMail(data: SendMailOptions) {
		return this.transport.sendMail(data);
	}

	sendMailWithConfig(config: IMailerConfig, data: SendMailOptions) {
		const tmpTransport = this.createTransport(config);
		return tmpTransport.sendMail(data);
	}

	async verifyConfig(config: IMailerConfig) {
		const tmpTransport = this.createTransport(config);
		try {
			await tmpTransport.verify();
		} catch (err) {
			throw WebError.badRequest(err.message);
		}
	}
}

export interface IMailerConfig {
	type: MailerType;
	options: SmtpOptions
}

export enum MailerType {
	SMTP = 'smtp',
	STUB = 'stub'
}
