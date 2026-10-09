const DEUBG = Array.from(process.argv).filter((arg) => [ "-d", "--debug" ].indexOf(arg) > -1);
module.exports = () => {
	if (!DEUBG) return
	console.log(...arguments);
}