const config = {};

config.assetsByType = {
	images: [ "jpg", 'png', 'gif', "jpeg" ],
	videos: [ "mp4", "avi", "m4v" ],
	sounds: [ "mp3", "ogg", "m4a" ],
	models: [ "blend", "obj", "glb", "gltf" ],
};
config.assetPreset   = {};
config.allAssets     = [].concat(...Object.values(config.assetsByType));
config.reverseAssets = { };
Object.keys(config.assetsByType).forEach((assetType) => {
	config.assetPreset[ assetType ] = [];

	config.assetsByType[ assetType ].forEach((extension) => { config.reverseAssets[ extension ] = assetType; });
});

module.exports = config;