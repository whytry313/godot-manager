class LocalStorageClass {
	#hooks = {};
	constructor() {
		this.listen = this.listen.bind(this);
		this.unlisten = this.unlisten.bind(this);
		this.get = this.get.bind(this);
		this.set = this.set.bind(this);
	}

	listen(prop, func) {
		if (!this.#hooks[ prop ]) { this.#hooks[ prop ] = []; }
		this.#hooks[ prop ] = this.#hooks[ prop ].filter(Boolean);
		if (this.#hooks[ prop ].indexOf(func) < 0) {
			this.#hooks[ prop ].push(func);
		}
	}

	unlisten(prop, func) {
		if (this.#hooks[ prop ].indexOf(func) > -1) {
			delete this.#hooks[ prop ][ this.#hooks[ prop ].indexOf(func) ];
			this.#hooks[ prop ] = this.#hooks[ prop ].filter(Boolean);
		}
	}

	has(prop) { return localStorage.getItem(prop) !== null; }

	get(prop) {
		const val = localStorage.getItem(prop);
		if (val) {
			var value = undefined;
			try { value = JSON.parse(val); } catch(e) {}
			return value;
		}
		return null;
	}

	set(prop, value) {
		localStorage.setItem(prop, JSON.stringify(value));
		if (this.#hooks[ prop ]) {
			this.#hooks[ prop ].forEach((func) => { if (func) { func(value); } });
		}
	}
}


const LocalStorage = new LocalStorageClass()
export default LocalStorage;