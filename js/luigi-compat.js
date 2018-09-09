'use strict';

/**
 * Include this file to maintain compatibility with older (pre-0.4.2)
 * versions of Luigi Template.
 */
var LuigiTemplate = Luigi.Template;
LuigiTemplate.prototype.Cache = Luigi.Cache;
LuigiTemplate.run = Luigi.run;
LuigiTemplate.VERSION = Luigi.VERSION;
LuigiTemplate.FILTERS = Luigi.FILTERS;
LuigiTemplate.Cache = Luigi.Cache;
LuigiTemplate.cache = Luigi.cache;
