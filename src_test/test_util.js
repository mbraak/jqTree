var utils_for_test = require('./utils_for_test');

var node_module = require('../src/node');

var Position = node_module.Position;
var util = node_module.util;

var test = QUnit.test;


QUnit.module('util');

test('Position.getName', function(assert) {
    assert.equal(Position.getName(Position.BEFORE), 'before');
    assert.equal(Position.getName(Position.AFTER), 'after');
    assert.equal(Position.getName(Position.INSIDE), 'inside');
    assert.equal(Position.getName(Position.NONE), 'none');
});

test('Position.nameToIndex', function(assert) {
    assert.equal(Position.nameToIndex('before'), Position.BEFORE);
    assert.equal(Position.nameToIndex('after'), Position.AFTER);
    assert.equal(Position.nameToIndex(''), 0);
});
