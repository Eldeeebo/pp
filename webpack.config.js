const path = require('path');

module.exports = {
  entry: './mainContentScript.js', // Entry point of the extension
  output: {
    filename: 'bundle.js',        // Name of the output bundled file
    path: path.resolve(__dirname, 'dist'), // Output directory (e.g., 'dist/')
    clean: true, // Clean the output directory before each build
  },
  // module: {
  //   rules: [
  //     {
  //       test: /\.js$/, // Apply this rule to .js files
  //       exclude: /node_modules/, // Don't transpile node_modules
  //       use: {
  //         // Attempt to use require.resolve to get the absolute path to the loader
  //         loader: require.resolve('babel-loader'), 
  //         options: {
  //           presets: ['@babel/preset-env'] // Use the env preset
  //         }
  //       }
  //     }
  //   ]
  // },
  // The resolveLoader section is also removed as it was related to babel-loader
  // resolveLoader: {
  //   modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
  // },
  // Optional: Add source maps for easier debugging,
  // 'cheap-module-source-map' is good for development.
  // For production, you might choose 'source-map' or none.
  devtool: 'cheap-module-source-map',
  mode: 'development', // Set mode to 'development' for now for better debugging
                       // Can be changed to 'production' for releases
};
