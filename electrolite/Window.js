const { BrowserWindow } = require('electron/main');
const fs                = require("fs");
const path              = require("path");
const API               = require('./API.js');
const idGenerator       = require('./lib/idGenerator.js');

class Window {
	#properties           = [];
	#methods              = [];
	#methodsAndProperties = [];

	constructor(specsInfo = {}, parent) {
		// Public window to access at any point
		this.window = undefined;
		// as any electron property should be allowed
		// to be managed, restrictions are up to the developper
		// to set and manage. getWindow() is only for code aesthetics

		this.id = undefined;

		this.API    = new API();
		this.parent = parent;
		this.specs  = specsInfo;
		this.src    = specsInfo ? specsInfo.src : undefined;
		this.hooks  = {};

		this.on        = this.on.bind(this);
		this.get       = this.get.bind(this);
		this.post      = this.post.bind(this);
		this.init      = this.init.bind(this);
		this.getWindow = this.getWindow.bind(this);

		this.init();
	}


	getWindow() { return this.window; }


	getMethods() { return this.#methods; }
	getProperties() { return this.#properties; }
	getMethodsAndProperties() { return this.#methodsAndProperties; }
	has(methodOrProp) { return this.#methodsAndProperties.indexOf(methodOrProp) > -1; }


	// Internal APi Get/Post route - exclusive to this window, use Electrolite.get for global routes
	use(middleware)       { this.API.middleware(middleware); return this; } // chain events
	get(route, callback)  { this.API.get(route,  callback); return this;  } // chain events
	post(route, callback) { this.API.post(route, callback); return this;  } // chain events


	async execute(commandString) {
		return this.window.webContents.executeJavaScript(commandString);
	}


	async apply(route, method, values) {
		// IPC handled by parent sinoce it should be handled once
		let routeElement = this.API.getRoute(route, method, this.window);
		if (!routeElement) {
			routeElement = this.parent.API.getRoute(route, method, this.window);
		}

		if (!routeElement) return undefined;
		const res = await routeElement(values);
		return res;
	}


	// Window event - see https://www.electronjs.org/docs/latest/api/browser-window#instance-events
	onWindowEvent(event, callback) {
		this.window.on(event, callback);
		return this; // chain events
	}

	// Sends ...data? from main to current window.on(eventName) 
	emit() {
		if (typeof arguments[0] !== "string" || arguments[0].trim().length === 0) throw new Error("emit expects a signal name");
		this.window.webContents.send(...arguments);
	}

	// Listens to eventName from window._API_.emit(eventName, ...data?)
	on(eventName, callback) {
		if (!this.hooks[eventName]) { this.hooks[eventName] = []; }
		this.hooks[ eventName ].push(callback);
	}

	async onEvent() {
		const args = Array.from(arguments);
		const eventName = args.shift();
		if (this.hooks[ eventName ]) {
			this.hooks[ eventName ].forEach((callback) => callback(...args));
		}
	}

	#injectWindowPropsInInstance() {
		const propertyNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this.window)).filter(e => e !== "constructor" && e !== "_init");
		const stackNames = [];
		for(let name in this.window) {
			if (name === "constructor" || name[0] === "_") { continue; }
			stackNames.push(name);
		}

		new Set([ ...stackNames, ...propertyNames ]).forEach((name) => {
			this.#methodsAndProperties.push(name);
			if (typeof this.window[name] === "function") {
				this.#methods.push(name);
			} else {
				this.#properties.push(name);
			}
		});
	}


	#getIcon() {
		let icon = this.specs.icon;
		if (!icon && process.env.npm_package_json) {
			const pkg = require(process.env.npm_package_json);
			let pkg_icon = undefined;
			if (pkg.build) { Object.keys(pkg.build).forEach((dist) => { if (pkg.build[dist].icon) { pkg_icon = pkg.build[dist].icon; } }) }
			if (pkg_icon) { icon = pkg_icon; }
		} else if (!icon && process.env.APPDIR) {
			icon = path.join(process.env.APPDIR, ".DirIcon");
		}
		return icon;
	}


	init() {
		if (!this.src) {
			throw new Error(`Window should have a "src" property pointing to an url or file`);
		}

		this.window = new BrowserWindow({
			width: this.specs.width,
			height: this.specs.height,
			x: this.specs.x,
			y: this.specs.y,
			...(this.specs.raw || { }),
			webPreferences: {
				// Keep this after raw to overwrite on security issues
				nodeIntegration: false,
				contextIsolation: true,
				preload: path.join(__dirname, 'lib/preloadTemplate.js')
			},
			icon: this.#getIcon()
		});

		this.id = idGenerator(this.window.id);

		this.window[ this.src.indexOf(":") > -1 ? "loadURL" : "loadFile" ](this.src);
		this.#injectWindowPropsInInstance();

		if (this.specs.after) {
			const options = {
				css: () => { this.window.webContents.insertCSS(this.specs.after.css); },
				debug: () => { this.window.webContents.openDevTools(); },
			};

			Object.keys(this.specs.after).forEach((key) => {
				options[ key ] && options[ key ]();
			});
		}

	}
}

module.exports = Window;