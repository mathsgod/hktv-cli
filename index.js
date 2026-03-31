#!/usr/bin/env node
const { Command } = require('commander');

const program = new Command();
program
  .name('hktv')
  .version('1.0.0')
  .description('HKTV 貨物搜索工具');

const search = require('./src/search');
const price = require('./src/price');

program.addCommand(search);
program.addCommand(price);

program.parse(process.argv);
