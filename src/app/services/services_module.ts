import {ContainerModule} from 'inversify';
import {IMailerConfig, MailerConfig, MailerService} from './mailer_service';
import {TranslateService} from './translate_service';

export class ServicesModule {

	private module: ContainerModule;

	constructor(mailerConfig: IMailerConfig) {
		this.module = new ContainerModule((bind) => {
			// Mail
			bind(MailerService).toSelf().inSingletonScope();
			bind<IMailerConfig>(MailerConfig).toConstantValue(mailerConfig);

			// Translations
			bind(TranslateService).toSelf().inSingletonScope();

		});
	}

	static create(mailerConfig: IMailerConfig): ContainerModule {
		let md = new ServicesModule(mailerConfig);
		return md.module;
	}
}
