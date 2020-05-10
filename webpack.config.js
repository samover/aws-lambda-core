const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: ['./src/index.ts'],
  externals: [nodeExternals()],
  devtool: 'source-map',
  resolve: {
    extensions: [ '.js', '.jsx', '.json', '.ts', '.tsx' ],
  },
  output: {
      path: __dirname,
      filename: './dist/index.js',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ejs$/,
        exclude: /node_modules/,
      },
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.ejs$/,
        exclude: /node_modules/,
      }
    ]
  },
};
