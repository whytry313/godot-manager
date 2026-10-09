const fs = require("fs");
const path = require("path");
const { protocol } = require("electron");
const electrolite = require("electrolite");
const isProd = process.env.NODE_ENV !== "dev";
const API = require("./server/API/index.js");
const Projects = require("./server/Scanners/Projects.js");
const Programs = require("./server/Scanners/Programs.js");
let ELECTRON_SRC = path.join(__dirname, "./public/index.html");
const Log = require("./server/Utils/Log.js");
const init = async () => {


	protocol.registerSchemesAsPrivileged([
	  { scheme: 'icon', privileges: { supportFetchAPI: true } }
	]);

	protocol.registerSchemesAsPrivileged([
	  { scheme: 'afile', privileges: { supportFetchAPI: true } }
	]);


	await API.init(electrolite);
	await electrolite.init();
	Programs.scan();

	Log("Arguments:", process.argv);

	const fileInArguments = getFileInArguments();
	if (fileInArguments) {
		const project = Projects.getProgramFromGodotFile(fileInArguments);
		if (!project || !project.int_v) {
			Log("Error: Project of version not found");
			Log(project);
			process.exit();
		}

		const program = Programs.getByVersion(project.int_v);
		if (program.path) {
			Log(`Running project ${ fileInArguments }`)
			return API.runProj(program, project, false);
		}
		Log("Program version not found for project fileInArguments");
		return process.exit();
	}


	if (!isProd) await createDevServer();
	const win = electrolite.createWindow({
		src: ELECTRON_SRC,
		width: 1080,
		height: 600,
		raw: { frame: false, transparent:true }
	});

	protocol.interceptFileProtocol("icon", (request, callback) => {
		const url = request.url.replace("icon://", '').replace(/\/$/, "");
		return callback({ path: Projects.hasIcon(url) ? url : null });
	});


	protocol.interceptFileProtocol("res", (request, callback) => {
		const url = request.url.replace("res://", '').replace(/\/$/, "").split(":");
		const project = url.shift();
		const filepath = decodeURI(url.join(":"));
		return callback({ path: Projects.getProjectFilePath(project, filepath) });
	});

    electrolite.get("/version", () => process.env.npm_package_version);
	win.window.once("ready-to-show", () => { Projects.getFoldersSizes(); });
	win.on("close", () => win.window.close());
	win.on("minimize", () => win.window.minimize());
	win.on("maximize", () => win.window.isMaximized() ? win.window.unmaximize() : win.window.maximize());


	Projects.scan();
	Programs.scan();



}



const getFileInArguments = () => {
	let file = null
	Array.from(process.argv).forEach((_arg) => {
		let filePath = null;
		let arg = _arg;
		if (!fs.existsSync(arg)) return;
		let stat = fs.lstatSync(arg);
		if (stat.isSymbolicLink()) {
			arg = fs.readlinkSync(arg);
			stat = fs.lstatSync(arg);
			Log("Symbolic link found in arguments:", _arg, " -> ", arg);
		}
		if (stat.isFile()) {
			filePath = arg;
			Log("File found in arguments:", arg);
		}

		if (filePath && filePath.indexOf("project.godot") > -1) {
			file = arg;
			Log("File set as main project file");
		}
	});
	return file;
}


const createDevServer = async () => {
	const createViteServer = require('vite').createServer;
	const port = 8152;
	ELECTRON_SRC = "http://localhost:"+port+"/";
	const server = await createViteServer({
		root: path.join(__dirname, "vue"),
		configFile: path.join(__dirname, "vue/vite.config.js"),
		server: { port: port },
	});

	await server.listen();
	server.printUrls();
	server.bindCLIShortcuts({ print: true });
}


init();
