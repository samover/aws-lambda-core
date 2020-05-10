const nodeExternals = require('webpack-node-externals');
var TypescriptDeclarationGenerator = require('tsd-webpack-plugin');

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
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ]
  },
  plugins: [
    new TypescriptDeclarationGenerator({
      moduleName:'aws-lambda-core',
      out:'./dist/index.d.ts',
    })
  ]
};
