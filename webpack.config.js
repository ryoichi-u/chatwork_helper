const assetsDir = "./src/js/"

let webpack = require("webpack");
let path = require("path");
let glob = require("glob");

const jsBasePath = path.resolve(__dirname, 'src/js/');
const targets = glob.sync(jsBasePath+'/*.js');

console.log(jsBasePath);
console.log(jsBasePath+'*.js');
console.log(targets);

let entries = {};

targets.forEach(value => {
  const re = new RegExp(jsBasePath+'/');
  const key = value.replace(re, '');
  entries[key] = value;
});

console.log(entries);

module.exports = {
  entry: entries,
  output: {
    path: path.join(__dirname, 'dist/js'),
    filename: '[name]',
  },
  resolve: {
    modules: [
      path.resolve(__dirname, "src/js/"),
      "node_modules"
    ],
  },
}

