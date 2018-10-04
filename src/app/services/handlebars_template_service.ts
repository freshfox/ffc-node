import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as layouts from 'handlebars-layouts';
import {inject, injectable} from 'inversify';

@injectable()
export class HandlebarsTemplateService {

	protected hbs;
	static readonly CONFIG = Symbol('TemplateConfig');

	static readonly DEFAULT_CONFIG: TemplateConfig = {
		path: null,
		partialsDirectory: 'partials'
	};

	private config: TemplateConfig;

	constructor(@inject(HandlebarsTemplateService.CONFIG) config: TemplateConfig) {
		this.config = Object.assign({}, HandlebarsTemplateService.DEFAULT_CONFIG, config);
		this.hbs = handlebars.create();
		this.hbs.registerHelper(layouts(this.hbs));
		this.registerPartials();
		this.registerLayouts();
	}

	private registerLayouts() {
		this.registerHelper(layouts(this.hbs));
	}

	private registerPartials() {
		const partialsDir = path.join(this.config.path, this.config.partialsDirectory);
		if (fs.existsSync(partialsDir)) {
			const files = fs.readdirSync(partialsDir);
			files.forEach((filename) => {
				const matches = /^([^.]+).hbs$/.exec(filename);
				if (!matches) {
					return;
				}
				const name = matches[1];
				const template = fs.readFileSync(path.join(partialsDir, filename), 'utf8');
				this.hbs.registerPartial(name, template);
			});
		}
	}

	registerHelper(name: string, callback?: (...args: any[]) => any) {
		this.hbs.registerHelper(name, callback);
	}

	compile(templateName: string): Template {
		let templatePath = path.resolve(path.join(this.config.path, templateName));
		let layoutTemplate = fs.readFileSync(templatePath).toString();
		return this.hbs.compile(layoutTemplate);
	}

	static render(template: Template, data): string {
		return template(data);
	}

}

export interface Template extends Function {
	(data: any): string;
}

export interface TemplateConfig {
	path: string;
	partialsDirectory?: string;
}
