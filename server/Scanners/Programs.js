const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const electrolite = require("../../electrolite/index.js");
const ext = require("./utils/getOSExtension.js")();

class ProgramsManager {
	#lastID = 0;
	#paths = [];
	#folders = {};
	#programs = [];
	#byID = {};

	constructor() {
		this.get = this.get.bind(this);
		this.scan = this.scan.bind(this);
	}

	#resetScanData() {
		this.#lastID = 0;
		this.#byID = {};
		this.#folders = {};
		this.#programs = [];
	}

	#scanFolder(folderPath) {
		if (this.#folders[ folderPath ]) return;
		const execs = [];
		fs.readdirSync(folderPath).forEach((currentPath) => {
			const scanPath = path.join(folderPath, currentPath);
			if (fs.lstatSync(scanPath).isDirectory()) {
				fs.readdirSync(scanPath).forEach((subPath) => {
					const subFilePath = path.join(scanPath, subPath);
					const file_ext = subFilePath.split(".").pop();
					if (ext.indexOf(file_ext) > -1) { execs.push(subFilePath); }
				});
			} else {
				const fileExt = currentPath.split(".").pop();
				if (ext.indexOf(fileExt) > -1) { execs.push(currentPath); }
			}
		});

		execs.forEach((execPath) => {
			const helpOutput = spawnSync(execPath, ["--help"], {
				stdio: 'pipe',
				encoding: 'utf-8',
			});
			const firstLine = (helpOutput.output[1] || '').split("\n").shift().replace(/\u001b\[.*?m/g, '');

			if (firstLine.indexOf('Godot Engine v') !== 0) return;
			const version = firstLine.match(/v([0-9]+\.[0-9]+\.[^\.]+)/)[1].split('.');
			const program = {
				id: "#"+this.#lastID,
				version: version[0],
				subversion: version[1],
				versionTag: [ version[0], version[1] ].join('.'),
				int_v: parseInt([ version[0], version[1] ].join('')),
				build: version[2],
				tag: version.join('.'),
				path: execPath,
				execName: execPath.split(/[\/\/]/).pop()
			};
			this.#lastID += 1;
			this.#programs.push(program);
			this.#byID[ program.id ] = program;
		});
	}

	get(id) { return id ? this.#byID[ id ] : this.#programs; }

	scan() {
		this.#resetScanData();
		this.#paths = electrolite.settings.get("programsPaths") || [];
		this.#paths.forEach(this.#scanFolder.bind(this));
		electrolite.emit("updatePrograms");
	}
}

const programsManager = new ProgramsManager();
module.exports = programsManager;