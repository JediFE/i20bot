'use strict';

var I20bot = require('../lib/i20bot');

var token = require('../token');

var i20bot = new I20bot({
    token: token
});

i20bot.run();
