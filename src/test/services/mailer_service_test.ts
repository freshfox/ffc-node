import 'reflect-metadata';
import '../../../config';
import {MailerService, MailerType} from '../../app/services/mailer_service';

describe('MailerService', function () {

	const config = {
		type: MailerType.SMTP,
		options: {
			host: 'smtp.sparkpostmail.com',
			port: 587,
			auth: {
				user: 'SMTP_Injection',
				pass: process.env.SMTP_PASSWORD
			}
		}
	};
	const mailerService = new MailerService(config);

    it('should verify mailer config', () => {

    	return mailerService.verifyConfig(config)

    });

    it('should send a mail', () => {

		return mailerService.sendMail({
			from: 'hello@tablechamp.at',
			to: 'test@example.com',
			subject: 'FFC Node Integration Test',
			html: '<h1>Hello</h1>' +
			'<p><a href="https://nopeitdoesntwork.com">Click this link</a> so the integration test passes. CI is waiting...</p>',
		});

    });

});
