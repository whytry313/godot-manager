const fs = require("fs");
const rexIsComment  = /^[\ ]{0,50};/;
const rexIsHeader = /^\[([a-z0-9\_]+)\]$/;
const rexIsVariable = /^([a-z\/_]+)=/;

const injectVersion = (bigStrJSON, mainVersion, file) => {
	const numversion = (json) => {
		if (json._v) {
			const toStr = json._v.split(".");
			json.main_v = toStr[0];
			json.int_v  = parseInt(toStr.join(''));
		}
		return json;
	};

	let newJSON = bigStrJSON;
	if (bigStrJSON && !bigStrJSON._v) {
		const parseVersion = {
			'4': (json) => {
				if (json.application && json.application["config/features"]) {
					const find_version = json.application["config/features"].filter(e => e.indexOf('4.') > -1);
					if (find_version.length) {
						json._v = find_version[0];
					}
				}
				return json;
			},
			'3': (json) => {
				if (json['config_version']) {
					json._v = [ mainVersion, parseInt(json['config_version']) + 2 ].join('.');
					json.application = { 'config/name': json.config.name };
				}
				return json;
			}
		}[ mainVersion+'' ];
		if (parseVersion) { newJSON = parseVersion(bigStrJSON); }
	}

	return numversion(newJSON);
};

const parseFile = (filepath, ignoreHeaders = []) => {
	if (!fs.existsSync(filepath)) return null;

	let config = {};
	let header   = null;
	let variable = null;
	let content  = '';
	let headerVariables = {};
	let mainVersion = null;

	const testParseVar = (bigStr) => {
		if (bigStr.indexOf("PackedStringArray(") === 0) {
			bigStr = bigStr.replace("PackedStringArray(", '[').replace(/\)$/, ']');
			mainVersion = 4;
		} else if (bigStr.indexOf("PoolStringArray(") === 0) {
			bigStr = bigStr.replace("PoolStringArray(", '[').replace(/\)$/, ']');
			mainVersion = 3;
		}

		if ([ '{', '[', '"'].indexOf(bigStr[0]) > -1) {
			var json = null;
			try { json = JSON.parse(bigStr); } catch(e) {}
			return json || bigStr;
		}
		return bigStr;
	};


	const lineParser = (line) => {
		const isComment = line.match(rexIsComment);
		if (isComment || !line.trim().length) return;

		const isVariable = line.match(rexIsVariable);
		if (isVariable) {
			if (content.length && variable) { headerVariables[ variable ] = content; content = ""; }
			variable = isVariable[1];
			content = line.replace(isVariable[0], '');
			return;
		}


		const isHeader = line.match(rexIsHeader);
		if (isHeader) {
			if (variable) { headerVariables[ variable ] = content.trim(); variable = null; content = ''; }
			if (ignoreHeaders.indexOf(header) < 0) {
				Object.keys(headerVariables).forEach((key) => {
					headerVariables[ key ] = testParseVar(headerVariables[ key ]);
				});
				if (header) { config[ header ] = { ...(config[ header ] || {}), ...headerVariables }; }
				else { config = { ...config, ...headerVariables }; }
			}
			headerVariables = {}; header = null;
			header = isHeader[1];
			return;
		}

		if (variable) { content += "\n"+line; }
	};

	fs.readFileSync(filepath, { encoding: "utf8" }).toString().split('\n').forEach(lineParser);
	if (variable) { headerVariables[ variable ] = content.trim(); variable = null; content = ''; }
	if (ignoreHeaders.indexOf(header) < 0) {
		Object.keys(headerVariables).forEach((key) => {
			headerVariables[ key ] = testParseVar(headerVariables[ key ]);
		});
		if (header) { config[ header ] = { ...(config[ header ] || {}), ...headerVariables }; }
		else { config = { ...config, ...headerVariables }; }
	}

	if (!mainVersion) {
		if (config.config && config.config.name) { mainVersion = 3; }
		else if (config.application && config.application["config/name"]) { mainVersion = 4; }
	}
	const res = injectVersion(config, mainVersion, filepath);
	return res;
}

module.exports = parseFile;