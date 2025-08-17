const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.watchFolders = config.watchFolders.filter(
  (folder) => !folder.includes(".gradle"),
);

module.exports = config;
