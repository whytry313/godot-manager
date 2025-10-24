const { contextBridge, ipcRenderer } = require('electron');

const errorWrapper = async (route, method, value) => {
	try {
		const res = await ipcRenderer.sendSync("callAPI", route, method, value);
		return res instanceof Error ? { UNCAUGHT_ERROR: res.message } : res;
	} catch (error) {
		return { UNCAUGHT_ERROR: error.message };
	}
}


const config = ipcRenderer.sendSync("get-config");


contextBridge.exposeInMainWorld(config.apiName, {
	get: async (route) => {
		const res = await errorWrapper(route, 'get', undefined);
		return res;
	},
	post: async (route, values) => {
		const res = await errorWrapper(route, 'post', values);
		return res;
	},
	on: (event, callback) => {
		return ipcRenderer.on(event, callback);
	},
	detach: (event, callback) => {
		ipcRenderer.removeListener(event, callback);
	},
	emit () {
		if (typeof arguments[0] !== "string" || arguments[0].trim().length === 0) throw new Error("emit expects a signal name");
		ipcRenderer.sendSync("emit", ...arguments);
	},
});