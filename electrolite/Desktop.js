const { ipcMain, protocol, screen, app } = require('electron');
const API             = require('./API.js');
const Screen          = require('./Screen.js');
const Window          = require('./Window.js');
const Settings        = require('./Settings.js');
const idGenerator     = require('./lib/idGenerator.js');


/*//

	Desktop methods represents the window manager

	- All methods are NOT exported, there's a layer
	  to restrict contextBridges to be exported - see exportProps

	- Uses Express electrolite[ get, post, use ] system methods

	- Events can be passed to all windows though electrolite[ emit, on ](event, data/callback),
	  to have window-specific events, use window.on/window.emit instead of electrolite.on/electrolite.emit

	- Accepts URL schemas through electrolite.protocol

	- Mode can be set to keepAlive or exitOnAllClose (default)

	- Quickstart:
		const init = async () => {
			// main.js
			electrolite.get("/", () => return "API up");
			electrolite.post("/", (evt, body) => console.log(body.message));

			electrolite.on("main-event", (message) => console.log("main process handles", message));

			electrolite.init();

			const win = electrolite.createWindow();
			win.on("window-event", (message) => console.log("window process handles", message));

			setTimeout(() => {
				electrolite.emit("custom-message", "message to all windows");
				win.emit("custom-message", "message for this specific window");
			}, 2000);
		};
		init();

		// HTML <script>
		window._API_.on("custom-message", console.log);
		// prints after 2 sec "message to all windows"
		// prints after 2 sec "message for this specific window"
		window._API_.emit("window-event", "window ready");
		window._API_.emit("main-event", "main window is ready");
		window._API_.get("/").then((response) => console.log(response));
		await window._API_.post("/", { message: "hello" });
//*/


class DesktopClass {
	#mode = "exitOnAllClose";
	#allowedModes = ["keepAlive", "exitOnAllClose"];

	constructor() {
		this.hasInit  = false;
		this.defaults = {};
		// Set electrolite.mode = "keepAlive" to keep
		// the app alive when all windows are closed  

		// API: get and post routes
		this.API = new API();
		this.app = app;
		// string name of API key passed to preaload to be accessed via window[ apiName ]
		this.apiName = "_API_";

		// Screens: Dectect all screens
		this.screens      = {};
		this.screensOrder = [];
		this.primary      = null;
		this.hooks        = {};

		this.settings = Settings;


		// Windows: Windows registry to manage
		this.defaults.window = { width: 800, height: 600, x: "center", y: "center", padding: 20 };
		this.windowsStack    = {};

		this.init               = this.init.bind(this);
		this.onEmit             = this.onEmit.bind(this);
		this.onCallAPI          = this.onCallAPI.bind(this);
		// this.createWindow       = this.createWindow.bind(this);
		this.onAllWindowsClosed = this.onAllWindowsClosed.bind(this);

		// Methods exported by this script
		this.exportProps = [
			"settings",         // Class an esay way to save data on disk
			"getScreens",       // func  explicit
			"getPrimaryScreen", // func  explicit
			"getScreenInfo",    // func  explicit
			"get",              // func  express get
			"post",             // func  express post
			"use",              // func  express use
			"protocol",         // func  register schema
			"createWindow",     // func  explicit
			"init",             // func  required to prepare express
			"emit",             // func  send event, data?
			"on",               // func  listen to event
			"mode",             // bool  close or keep alive on all windows closed
		].map((method) => {
			if (typeof this[ method ] === "function") this[ method ] = this[ method ].bind(this);
			return method;
		});

		ipcMain.on("get-config", (event) => {
			event.returnValue = { apiName: this.apiName };
			return event;
		});
	}

	get mode () { return this.#mode; }
	set mode(val) { if (this.#allowedModes.indexOf(val) < 0) { throw new Error(`Only ${ this.#allowedModes.join(', ') } modes allowed`) } this.#mode = val; }

	//////////////////////////////// Public Methods

	// List all screen names by order
	getScreens() { return this.screensOrder; }
	// Get info about the primary screen
	getPrimaryScreen() { return this.screens[ this.primary ]; }
	// Get info about a specific screen by name
	getScreenInfo(name) { return typeof name === "string" ? this.screens[ name ] : undefined; }

	// Express-based methods
	get(route, callback)  { this.API.get(route,  callback); return this; }  // chain events
	post(route, callback) { this.API.post(route, callback); return this; } // chain events
	use(middleware)       { this.API.use(middleware); return this; } // chain events

	// Register custom schema (eg: app --> url="app://my/file.jpg")
	protocol(name, callback) {
		this.#failSafe("reverse");
		// Init protocols only if called
		if (!this.protocols) { this.protocols = {}; }
		if (this.protocols[name]) throw new Error(`Protocol "${ name }" already exists.`);

		this.protocols[ name ] = callback;
		protocol.registerSchemesAsPrivileged([{
			scheme: name,
			privileges: { standard: true, secure: true, supportFetchAPI: true }
		}]);
	}

	createWindow(specsInfo) {
		/* specsInfo params:
			* x:       Int(pixels) | String[ percent, "center", "min", "max" ]
			* y:       Int(pixels) | String[ percent, "center", "min", "max" ]
			* width:   Int(pixels) | String[ percent ] // "width = center" is nonsensical
			* height:  Int(pixels) | String[ percent ] // "height = center" is nonsensical
			*
			* padding: Int(pixels)
			*          Space to unstick the window from the border
			*
			* screen:  String | Array(String) - screenName | "left" | "right")
			*          Screen priority, mainScreen as default or if not found
			*
			* debug:   Boolean - Enable/Disable webTools on window
			* type:    String - "background" | "borderless" | "glass" | "borderlessGlass" | "blurred" | "borderlessBlurred"
			* raw:     Object - BrowserWindow options passed driectly to constructor
			*
			* More info:
			* see #getWindowPosition for width, height, x, y
			* see #getScreenName     for screen
		*/
		this.#failSafe();
		const winType    = this.#getWindowType(specsInfo);
		const params     = { ...this.defaults.window, ...winType };
		const screenName = this.#getScreenName(specsInfo.screen);
		const specs      = this.#getWindowPosition(params, screenName);

		const window = new Window(specs, this);
		this.windowsStack[ window.id ] = window;
		this.windowsStack[ window.id ].on('close', () => {
			delete this.windowsStack[ window.id ];
		});
		// On close event --> remove id from stack
		return this.windowsStack[ window.id ];
	}


	async init(options = {}) {
		if (options && options.apiName && options.apiName.length > 0) {
			this.apiName = options.apiName;
		}

		await this.app.whenReady();

		this.app.on('activate', () => {
			console.log("activated");
		}).on('window-all-closed', () => {
			if (process.platform !== 'darwin') { this.app.quit(); }
		});

		this.hasInit = true;
		await this.#detectScreens();

		ipcMain.on("callAPI", this.onCallAPI);
		ipcMain.on("emit", this.onEmit);
		app.on('window-all-closed', this.onAllWindowsClosed);

		if (this.protocols) {
			Object.keys(this.protocols).forEach((protocolName) => {
				protocol.handle(protocolName, this.protocols[ protocolName ]);
			});
		}
	}


	// Sends ...data? from main to all window.on(eventName) 
	emit() {
		if (typeof arguments[0] !== "string" || arguments[0].trim().length === 0) throw new Error("emit expects a signal name");
		Object.values(this.windowsStack).forEach((ctx_window) => { ctx_window.window.webContents.send(...arguments); });
	}


	// Listens to eventName from any window._API_.emit(eventName, ...data?)
	on(eventName, callback) {
		if (!this.hooks[eventName]) { this.hooks[eventName] = []; }
		this.hooks[ eventName ].push(callback);
	}


	//////////////////////////////// Context bridges


	async onCallAPI (event, route, method, values) {
		const res = await this.windowsStack[ this.#getIDFromEvent(event) ].apply(route, method, values);
		event.returnValue = res;
		return event;
	}


	onEmit() {
		const args = Array.from(arguments); const event = args.shift();
		const eventName = args[0];// args[1] before shift
		this.windowsStack[ this.#getIDFromEvent(event) ].onEvent(...args);
		if (this.hooks[ eventName ]) { this.hooks[ eventName ].forEach((ctx_window) => ctx_window(...args)); }
		event.returnValue = true;
		return true;
	}

	onAllWindowsClosed() {
		if (this.#mode !== "keepAlive") {
			  // On OS X it is common for applications and their menu bar
			  // to stay active until the user quits explicitly with Cmd + Q
			if (process.platform !== 'darwin') {
				app.quit()
			}
		}
	}


	//////////////////////////////// Private Methods


	#getIDFromEvent(event) {
		return idGenerator(event.sender.id);
	}


	#failSafe(reverse) {
		// Internal function to avoid starting before init ran
		// as API and window defaults can be set beforehand
		if (!this.hasInit && !reverse) {
			throw new Error("Desktop must init first");
		} else if (reverse && this.hasInit) {
			throw new Error("This function should be laucnhed before init");
		}
	}


	async #detectScreens() {
		this.#failSafe();
		// Internal function to detect screens used by Window
		const displays = screen.getAllDisplays();
		const primary  = { id: screen.getPrimaryDisplay().id };
		displays.sort((a,b) => a.workArea.x > b.workArea.x ? 0 : -1).map((screenInfo) => {
			const screenElement = new Screen(screenInfo, primary.id);
			this.screensOrder.push(screenElement.id);
			this.screens[ screenElement.id ] = screenElement;
		});

		const hasPrimary = Object.values(this.screens).filter(e => e.primary)[0];
		this.primary = hasPrimary ? hasPrimary.id : Object.keys(this.screens)[0];
	}


	#getWindowPosition(specs, screenName = this.primary) {
		this.#failSafe();
		/* specsInfo[ width | height | x | y ] params  String
			* Accepts:  String[Int, Float]%, "center", "min", "max", Int // Pixels
			* Default:  "center"
			* Example:  { x: "min", y: "center", width: "20%", height: 400 },
			// -------> x at minimum of screen (see "screen" on #getScreenName),
			// -------> y at center of screen, width at 20% of screen width, height of 400 pixels
		*/

		const mainScreen = this.screens[ screenName ];
		const padding    = Number.isInteger(parseInt(specs.padding)) ? parseInt(specs.padding) : this.defaults.window.padding;

		const translateString = (str, originValue, isSize) => {
			const positions = {
				center(origin) { return origin * 0.5; },
				min   (origin) { return 0; },
				max   (origin) { return origin; },
			};

			if (str.match(/[0-9]+(\.[0-9]{1,2})?%$/)) {
				// Percent value
				const percent = parseFloat(str);
				return originValue * (percent/100);
			} else if (positions[ str ]) {
				if (isSize) throw new Error(`Values such as center or min are not accepted on with/height`);
				return positions[ str ](originValue);
			}

			return originValue;
		};

		const props = {
			x(spec)      { return translateString(spec, mainScreen.width  - specs.width); },
			y(spec)      { return translateString(spec, mainScreen.height - specs.height); },
			height(spec) { return translateString(spec, mainScreen.height, true); },
			width(spec)  { return translateString(spec, mainScreen.width,  true); },
		};

		const applyProp = (spec) => {
			const value = specs[ spec ];
			if (typeof value === 'string' && props[ spec ]) {
				specs[ spec ] = parseInt(props[ spec ]( value ));
			}
		};

		[ "width", "height" ].forEach(applyProp);
		[ "x", "y" ].forEach(applyProp);

		specs.x = specs.x + mainScreen.x;
		specs.y = specs.y + mainScreen.y;

		// Limit size by padding
		if (specs.width  > (screen.width -  (padding*2))) { specs.width  = screen.width  - (padding*2); specs.x = padding; }
		if (specs.height > (screen.height - (padding*2))) { specs.height = screen.height - (padding*2); specs.y = padding; }

		return specs;
	}


	#getWindowType(specsInfo) {
		const commonSpecs = { autoHideMenuBar: true, frame: true };

		if (!specsInfo.type) return { ...commonSpecs, ...(specsInfo || {}) };
		if (!specsInfo.raw) { specsInfo.raw = {}; }

		const glassSpecs  = { ...commonSpecs, frame: true, transparent: true, hasShadow: true, };
		const glassSpecsAfter = {
			...(specsInfo.after || {}),
			css: `html { background: rgba(255, 255, 255, 0.2);
				backdrop-filter: blur(12px);
				-webkit-backdrop-filter: blur(12px);`
		};

		const blurredAfter = {
			...(specsInfo.after || {}),
			css: `html { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);`
		};

		const types = {
			background: () => {
				specsInfo.width    = specsInfo.width || "full";
				specsInfo.height   = specsInfo.height || "full";
				specsInfo.x        = specsInfo.x || "min";
				specsInfo.y        = specsInfo.y || "min";
				specsInfo.raw.type = "splash";
				specsInfo.raw.titleBarStyle = "hidden";
				specsInfo.raw = { ...specsInfo.raw, ...commonSpecs };
			},

			borderless: () => {
				specsInfo.raw = { ...specsInfo.raw, ...commonSpecs, frame: false };
			},

			glass: () => {
				specsInfo.raw = { ...specsInfo.raw, ...glassSpecs };
				specsInfo.after = glassSpecsAfter;
			},

			borderlessGlass: () => {
				specsInfo.raw = { ...specsInfo.raw, ...glassSpecs, frame: false };
				specsInfo.after = glassSpecsAfter;
			},

			blurred: () => {
				specsInfo.raw = { ...specsInfo.raw, ...glassSpecs, frame: true };
				specsInfo.after = blurredAfter;
			},

			borderlessBlurred: () => {
				specsInfo.raw = { ...specsInfo.raw, ...glassSpecs, frame: false };
				specsInfo.after = blurredAfter;
			},
		};

		if (types[ specsInfo.type ]) { types[ specsInfo.type ](); }
		else { throw new Error(`Unkown type "${ specsInfo.type }", options are:\n${ Object.keys(types) }.\nIf you want to set BrowserWindow.type, use options.raw instead`); }

		if (specsInfo.debug) {
			specsInfo.after = { ...(specsInfo.after || {}), debug: true };
			delete specsInfo.debug;
		}

		delete specsInfo.type;
		return specsInfo;
	}


	#getScreenName(screen) {
		this.#failSafe();
		/* specsInfo.screen params   String | Array
			* Accepts:  nameOfScreen, (left, right)
			* Default:  Undefined = primary screen
			* Example:  screen=[ "HDMI-2", "right" ],
			// -------> Show in HDMI-2 if exists,
			// -------> or show on the right if HDMI-2 doesn't exist
		*/
		if (!screen || screen === 'primary') {
			return this.primary;
		} else if (this.screens[ screen ]) {
			return screen;
		}

		const screensPrefs = Array.isArray(screen) ? screen : [ screen ];
		const orderScreens = screensPrefs.filter(e => e === "left" || e === "right")[0] === "right" ? "right" : "left";
		const screensOrder = orderScreens === "right" ? [ ...this.screensOrder ].reverse() : [ ...this.screensOrder ];
		const namesScreens = screensPrefs.filter(e => e !== "left" && e !== "right");
		const screenByName = namesScreens.length > 0 ? this.screensOrder.filter(e => namesScreens.indexOf(e) > -1)[0] : null;
		return screenByName || screensOrder[0];
	}

};

const desktop = new DesktopClass();
const exportProps = {};
desktop.exportProps.forEach((method) => exportProps[ method ] = desktop[ method ]);
module.exports = exportProps;