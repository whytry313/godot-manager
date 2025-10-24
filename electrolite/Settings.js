const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const SETTINGS_FILE_NAME = "saved-settings.json";

class SettingsClass {
	#settings = {};
	#path = path.join(app.getPath('userData'), SETTINGS_FILE_NAME);

	constructor() {

		this.set = this.set.bind(this);
		this.get = this.get.bind(this);
		this.update = this.update.bind(this);
		this.delete = this.delete.bind(this);
		this.getFilePath = this.getFilePath.bind(this);

		this.#init();
	}

	set(prop, value, returnNewSettings) {
		if (this.#settings[ prop ] && this.#settings[ prop ] === value) return;
		this.#settings[ prop ] = value;
		this.#saveFile();
		if (returnNewSettings) { return this.#settings; }
	}

	update(prop, value, returnNewSettings) {
		if (typeof this.#settings[ prop ] !== "undefined") {
			return this.set(prop, value, returnNewSettings);
		}
		return new Error(`Can't update non-existing key "${ prop }"`);
	}

	get(prop) { return this.#settings[ prop ]; }

	delete(prop) {
		if (typeof this.#settings[ prop ] === "undefined") return;
		delete this.#settings[ prop ];
		this.#saveFile();
	}

	getFilePath() { return this.#path; }

	#saveFile() {
		fs.writeFileSync(this.#path, JSON.stringify(this.#settings, null, 4));
	}

	#init() {
		if (fs.existsSync(this.#path)) {
			try {
				this.#settings = JSON.parse(fs.readFileSync(this.#path).toString());
			} catch(error) {
				throw new Error(`Error while parsing "${ this.#path }" save file, it looks like the file doesn't respect JSON format.`, error);
			}
		}
	}
}

const Settings = new SettingsClass();
module.exports = Settings;