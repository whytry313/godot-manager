class Screen {
	#info = {};
	constructor(info, primaryID) {
		// Priate
		this.#info   = info;

		// Public
		this.primary = primaryID === info.id;
		this.label   = (info.label && info.label.length > 0) ? info.label : "noLabel";
		this.id      = `#${ this.#info.id }-${ this.label }`;

		this.x      = this.#info.workArea.x;
		this.y      = this.#info.workArea.y;
		this.width  = this.#info.workArea.width;
		this.height = this.#info.workArea.height;
	}
};
module.exports = Screen;