const fs            = require("fs");
const path          = require("path");
const config        = require("../config.js");
const parseCFG      = require("./utils/parser.cfg.js");
const electrolite   = require("../../electrolite/index.js");
let toggle = false;

class ProjectsManager {
	#lastID = 0;
	#byID = {};
	#paths = [];
	#folders = {};
	#projects = [];
	#nbAssets = 0;
	#projectsAssets = {};
	#icons = [];
	#max_depth = 3;
	#ignoreFolders = [ "addons", ".git" ];
	#settings = { disableAssets: false, ignoreFolders: [] };

	constructor() {
		this.get = this.get.bind(this);
		this.scan = this.scan.bind(this);
		this.hasIcon = this.hasIcon.bind(this);
		this.getPaths = this.getPaths.bind(this);
		this.getProjectFilePath = this.getProjectFilePath.bind(this);
	}

	#parseProject(filePath, root) {
		const data = parseCFG(filePath, ['input', 'importer_defaults']);
		if (data && data.application) {
			const dir = path.dirname(filePath);
			const project = {
				name: "",
				tags: [],
				version: '',
				path_full: dir,
				path: dir.replace(root, "@"),
				nbPlugins: 0,
				plugins: [],
				description: '',
				lastModified: 0,
				project: filePath,
			};
			project.name = data.application['config/name'];
			project.description = data.application['config/description'];
			project.plugins = ((data.editor_plugins && data.editor_plugins.enabled) || []).map(e => e.replace("/plugin.cfg", ""));
			project.nbPlugins = project.plugins.length;
			project.version = data._v || '';
			project.main_v = data.main_v || '';
			project.int_v  = data.int_v  || 0;
			project.lastModified = fs.lstatSync(filePath).mtime;
			// project.version = data.application["config/features"] && data.application["config/features"][0] || '';
			if (data.application["config/icon"]) {
				const icon = path.join(dir, data.application["config/icon"].replace(/^res:\/\//, ''));
				if (icon && fs.existsSync(icon)) {
					project.icon = icon;
					this.#icons.push(project.icon);
				}
			}
			return project;
		}
		return null;
	}

	#scanAssets(projectPath) {
		const assets = {
			files: { ...JSON.parse(JSON.stringify(config.assetPreset)) },
			nbAssets: 0,
			fileStack: [],
		};
		let foundFiles = 0;

		const finder = (folder, depth = 0) => {
			const files = fs.readdirSync(folder).filter(e => !e.endsWith(".import"));
			files.forEach((name) => {
				const filepath = path.join(folder, name);
				const stat = fs.lstatSync(filepath);
				if (stat.isDirectory()) {
					if (depth === 0 && (name === "addons" || name === ".godot")) return;
					finder(filepath, depth + 1);
					return;
				} else if (filepath.indexOf(".") < 0) return;

				const ext = filepath.split(".").pop();
				if (config.allAssets.indexOf(ext) > -1) {
					foundFiles++;
					const res = filepath.replace(projectPath+"/", "");
					assets.fileStack.push(res);
					assets.files[ config.reverseAssets[ ext ] ].push({
						filepath,
						ext,
						res,
						name,
						folder,
						size: stat.size
					});
				}
			});
		};

		finder(projectPath);
		assets.nbAssets = foundFiles;

		return assets;
	}

	#resetScanData() {
		this.#folders = {};
		this.#lastID = 0;
		this.#nbAssets = 0;
		this.#icons = [];
		this.#byID = {};

		this.#projects = [];
		this.#projectsAssets = {};
	}

	#scanFolder(folderPath, root, depth = 0) {
		if (this.#folders[ folderPath ] || depth > this.#max_depth) return;

		const inCurrentFolder = path.join(folderPath, "project.godot");
		if (fs.existsSync(inCurrentFolder)) {
			const project = this.#parseProject(inCurrentFolder, root);
			if (project) {
				this.#folders[ folderPath ] = true;
				project.id = "#" + this.#lastID;
				this.#lastID += 1;
				this.#projects.push(project);
				this.#byID[ project.id ] = project;
				this.#projectsAssets[ project.id ] = this.#settings.disableAssets ? {} : this.#scanAssets(folderPath);
				this.#byID[ project.id ].nbAssets = this.#projectsAssets[ project.id ].nbAssets;
				this.#nbAssets += this.#projectsAssets[ project.id ].nbAssets;
			}
			return null;
		}

		const contents = fs.readdirSync(folderPath);
		contents.forEach((dir) => {
			if (this.#ignoreFolders.indexOf(dir) > -1) return;
			var _dir = path.join(folderPath, dir);
			if (fs.lstatSync(_dir).isDirectory()) {
				this.#scanFolder(_dir, root, depth + 1);
				this.#projects.sort((a,b) => a.lastModified > b.lastModified ? -1 : 0);
			}
		});
	}

	getProjectFilePath(project, url) {
		if (this.#projectsAssets[ project ] && this.#projectsAssets[ project ].fileStack.indexOf(url) > -1) {
			return path.join(this.#byID[ project ].path_full, url);
		}
		return null;
	}

	hasIcon(pathFile) { return this.#icons.indexOf(pathFile) > -1; }

	get(id) { return id ? this.#byID[ id ] : { projects: this.#projects, nbAssets: this.#nbAssets }; }
	getAddons(id) {
		if (!this.#byID[ id ] || !fs.existsSync(this.#byID[ id ].path_full+"/addons")) { return null; }
		const project = JSON.parse(JSON.stringify(this.#byID[ id ]));
		const addons_path = path.join(project.path_full, "addons");
		const folders = fs.readdirSync(addons_path);
		const addons = folders.map((folder) => {
			const folderPath = path.join(addons_path, folder);
			const cfgfile = path.join(folderPath, "plugin.cfg");
			if (!fs.existsSync(cfgfile)) return null;
			let addon = parseCFG(cfgfile);
			if (!addon.plugin) return null;
			addon = addon.plugin;
			addon.realPath = folderPath;
			addon.path = folderPath.replace(project.path_full, "res:/");
			addon.enabled = project.plugins.indexOf(addon.path) > -1;
			return addon;
		}).filter(Boolean).sort((a, b) => a.enabled > b.enabled ? -1 : 0);
		project.addons = addons;
		return project
	}
	getAssets(id) { return this.#projectsAssets[ id ]; }
	getPaths() { return this.#paths || []; }

	scan(dontEmit = false) {
		this.#resetScanData();
		this.#paths = electrolite.settings.get("projectsPaths") || [];
		const settingsKeys = Object.keys(this.#settings);
		const userSettings = electrolite.settings.get("projectsSettings") || {};
		Object.keys(userSettings).forEach((key) => {
			if (settingsKeys.indexOf(key) < 0) return;
			this.#settings[ key ] = userSettings[ key ];
		});
		this.#ignoreFolders = Array.from(new Set([
			...[ "addons", ".git" ],
			...(this.#settings.ignoreFolders || [])
		]));
		this.#paths.forEach((f) => this.#scanFolder(f, f));
		!dontEmit && electrolite.emit("updateProjects");
	}
}

const projectsManager = new ProjectsManager();
module.exports = projectsManager;