var utils_for_test = require('./utils_for_test');

var tree_vars = utils_for_test.getTreeVariables();

var Position = tree_vars.Position;
var _indexOf = tree_vars._indexOf;
var indexOf = tree_vars.indexOf;


QUnit.module('util');

test('indexOf', function(assert) {
    assert.equal(indexOf([3, 2, 1], 1), 2);
    assert.equal(_indexOf([3, 2, 1], 1), 2);
    assert.equal(indexOf([4, 5, 6], 1), -1);
    assert.equal(_indexOf([4, 5, 6], 1), -1);
});

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
