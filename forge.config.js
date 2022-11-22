module.exports = {
    packagerConfig: {
	protocols: [
	    {
		protocol: 'librarynb',
		name: 'librarynb',
		schemes: 'librarynb'
	    }
	]
    },
    rebuildConfig: {},
    makers: [
	{
	    name: '@electron-forge/maker-squirrel',
	    config: {},
	},
	{
	    name: '@electron-forge/maker-zip',
	    platforms: ['darwin'],
	},
	{
	    name: '@electron-forge/maker-deb',
	    config: {},
	},
	{
	    name: '@electron-forge/maker-rpm',
	    config: {},
	},
  ],
};
