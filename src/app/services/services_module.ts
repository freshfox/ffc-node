import {ContainerModule} from 'inversify';
import {IMailerConfig, MailerConfig, MailerService} from './mailer_service';
import {ITranslateConfig, TranslateConfig, TranslateService} from './translate_service';

export class ServicesModule {


	static create(): ServicesModuleBuilder {
		return new ServicesModuleBuilder();
	}
}

export class ServicesModuleBuilder {

	private mailerConfig: IMailerConfig;
	private translationConfig: ITranslateConfig;

	constructor() {

	}

	setMailerConfig(config: IMailerConfig) {
		this.mailerConfig = config;
		return this;
	}

	setTranslationConfig(config: ITranslateConfig) {
		this.translationConfig = config;
		return this;
	}

	build() {
		return new ContainerModule((bind) => {
			// Mail
			if (this.mailerConfig) {
				bind(MailerService).toSelf().inSingletonScope();
				bind<IMailerConfig>(MailerConfig).toConstantValue(this.mailerConfig);
			}

			// Translations
			if (this.translationConfig) {
				bind(TranslateService).toSelf().inSingletonScope();
				bind<ITranslateConfig>(TranslateConfig).toConstantValue(this.translationConfig);
			}

		});
	}

}
