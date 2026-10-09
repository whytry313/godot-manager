const DEBUG = Array.from(process.argv).filter((arg) => [ "-d", "--debug" ].indexOf(arg) > -1).length > 0;
module.exports = function() {
	if (!DEBUG) return;
	console.log(...arguments);
}