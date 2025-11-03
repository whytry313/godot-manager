const fs = require("fs");
const path = require("path");
const { protocol } = require("electron");
const electrolite = require("electrolite");
const isProd = process.env.NODE_ENV !== "dev";
const API = require("./server/API/index.js");
const Projects = require("./server/Scanners/Projects.js");
const Programs = require("./server/Scanners/Programs.js");
let ELECTRON_SRC = path.join(__dirname, "./public/index.html");

const init = async () => {


	protocol.registerSchemesAsPrivileged([
	  { scheme: 'icon', privileges: { supportFetchAPI: true } }
	]);

	protocol.registerSchemesAsPrivileged([
	  { scheme: 'afile', privileges: { supportFetchAPI: true } }
	]);


	await API(electrolite);
	await electrolite.init();


	if (!isProd) await createDevServer();
	const win = electrolite.createWindow({
		src: ELECTRON_SRC,
		width: 1080,
		height: 600,
		raw: { frame: false, transparent:true }
	});


	win.on("close", () => win.window.close());
	win.on("minimize", () => win.window.minimize());
	win.on("maximize", () => win.window.isMaximized() ? win.window.unmaximize() : win.window.maximize());


	Projects.scan();
	Programs.scan();


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