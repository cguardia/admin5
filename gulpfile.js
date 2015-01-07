var requireDir = require('require-dir');

// Require all tasks in gulp/tasks, including sub folders
requireDir('./gulp/tasks', {recurse: true});