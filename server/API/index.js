// const electrolite= require("../../electrolite/index.js");
const fs             = require("fs");
const path           = require("path");
const { spawn }      = require("child_process");
const Projects       = require("../Scanners/Projects.js");
const Programs       = require("../Scanners/Programs.js");
const Presets        = require("../Presets/index.js");
const simplifier     = require("../Utils/releasesSimplifier.js");
const { app, shell, dialog } = require("electron");

const runProj = async (program, project, inTerminal) => {
	const env = {};
	Object.keys(process.env).forEach((key) => {
		if (key.toLowerCase().indexOf("node_") !== 0 && key.toLowerCase().indexOf("npm_") !== 0) {
			env[ key ] = process.env[ key ];
		}
	});
	let msTimeout = 5000;
	let args = [ program.path , project.project ];
	if (inTerminal) {
		args = [ "x-terminal-emulator", "-e", ...args ];
		msTimeout = 1000;
	}
	var main = args.shift();
	const proc = spawn(main, args, { detached: true, env, stdio: 'ignore'});
	proc.unref();
	setTimeout(() => { process.exit(); }, msTimeout);
};

const overwriteVersion = (program, project) => {
	const file = fs.readFileSync(project.project).toString();
	const hasVersion = file.match(/^_v="[^"]{1,}"/m);
	if (hasVersion) {
		const _v = `_v="${ program.versionTag }"`;
		if (hasVersion[0] != _v) {
			const newV = file.replace(/^_v="[^"]{1,}"/m, _v);
			console.log(`Updated "${ project.project }" to ${ newV }`);
			return console.log(newV);
		}
		return console.log("version match");
	} else {
		const _v = `_v="${ program.versionTag }"`;
		const newFile = file.replace("[application]", _v+"\n\n[application]");
		fs.writeFileSync(project.project, newFile);
		console.log(`Edited "${ project.project }" to ${ _v }`);
	}
};


const cleanAndGetLastRelease = () => {
	const folder = app.getPath('userData');
	const files = fs.readdirSync(folder).filter(e => e.indexOf('godot-remote-') === 0).map(e => path.join(folder, e));
	files.sort();
	if (files.length > 0) {
		const latest = files.pop();
		files.forEach(file => fs.unlinkSync(file));
		return require(latest);
	}
	return null;
};

module.exports = async (electrolite) => {

	// Projects
	electrolite.get("/projects", () => Projects.get());
	// Programs
	electrolite.get("/programs", () => Programs.get());


	// Settings
	electrolite.get("/settings", () => {
		return {
			programs: electrolite.settings.get("programsPaths") || [],
			projects: electrolite.settings.get("projectsPaths") || [],
			projectsSettings: electrolite.settings.get("projectsSettings") || {},
		};
	});

	// Assets
	electrolite.get("/projectAssets/:id", (req) => {
		if (req.params && req.params.id) { return Projects.getAssets("#" + req.params.id); }
		return null;
	});

	// Addons
	electrolite.get("/projectAddons/:id", (req) => {
		if (req.params && req.params.id) { return Projects.getAddons("#" + req.params.id); }
		return null;
	});

	electrolite.post("/settings", (req) => {
		if (!req.body) return null;
		let updateProjects = false;
		let updatePrograms = false;
		if (req.body.programs) { electrolite.settings.set("programsPaths", req.body.programs); updatePrograms = true; }
		if (req.body.projects) { electrolite.settings.set("projectsPaths", req.body.projects); updateProjects = true; }
		if (req.body.projectsSettings) { electrolite.settings.set("projectsSettings", req.body.projectsSettings); updateProjects = true; }

		if (updateProjects) { Projects.scan(); }
		if (updatePrograms) { Programs.scan(); }
		return null;
	});


	electrolite.post("/openFolder", (req) => {
		if (!req.body || !req.body.filepath) return null;
		shell.showItemInFolder(req.body.filepath);
		return null;
	});


	electrolite.post("/openProject", (req) => {
		const project = Projects.get(req.body.project || '#none');
		const program = Programs.get(req.body.program || '#none');
		const inTerminal = !!req.body.inTerminal;
		if (!project || !program) return null;
		overwriteVersion(program, project);
		runProj(program, project, inTerminal).then(() => {});
	});


	electrolite.post("/createProject", (req) => {
		const { name, folder, open, program } = req.body || {};
		if (!(name && folder && program)) { return "Wrong parameters"; }
		const project = { project: path.join(folder, "project.godot") };
		const preset = Presets[ program.version ];
		if (!preset) return `NO_PRESET:${ program.version }`;

		const header = preset.project.header.replace("%APP_NAME" ,name);

		fs.writeFileSync(project.project, header);
		if (open) { runProj(program, project); }
		electrolite.emit("updateProjects");
		return "";
	});

	electrolite.get('/godot-remotes', cleanAndGetLastRelease);

	electrolite.get('/godot-remotes/download', async (req, res) => {
		const folder = app.getPath('userData');
		const filePath = path.join(folder, `godot-remote-${ new Date().getTime() }.json`);
		const data = await fetch("https://api.github.com/repos/godotengine/godot/releases").then(d => d.json());
		fs.writeFileSync(filePath, JSON.stringify(  simplifier(data)  , null, 4));
		return cleanAndGetLastRelease();
	});

	electrolite.get("/scan", async () => {
		await new Promise((res) => {
			Projects.scan(true);
			Programs.scan(true);
			return res();
		});
		return true;
	});


	electrolite.get("/openFolder", async (req) => {
		const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
		if (result.canceled) { return null; }
		else { return result.filePaths[0]; }
	});


	electrolite.get("/createProjectFolder", async () => {
		const root = Projects.getPaths()[0];
		const result = await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'],  ...( root ? { defaultPath: root } : {}) });
		if (result.canceled) { return null; }
		else { return result.filePaths[0]; }
	});


	electrolite.post("/openLink", async (req) => {
		if (!req.body || !req.body.url || req.body.url.indexOf("http") !== 0) return null;
		shell.openExternal(req.body.url)
		return null;
	});


	electrolite.post("/isEmpty", async (req) => {
		if (!req.body || !req.body.folder || !fs.existsSync(req.body.folder)) return null;
		const files = fs.readdirSync(req.body.folder).filter(e => e !== "." && e !== "..");
		return files.length === 0;
	});

};