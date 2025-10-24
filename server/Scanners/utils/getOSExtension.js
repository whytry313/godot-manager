const os = require("os");
module.exports = () => {
	const platform = os.platform().toLowerCase();
	let ext = [ "exe" ];
	if (platform.indexOf("win") > -1)        { ext = [ "exe" ]; }
	else if (platform.indexOf("mac") > -1)   { ext = [ "dmg" ]; }
	else if (platform.indexOf("linux") > -1) { ext = [ "x86_64", "64", "32" ]; }
	return ext;
}