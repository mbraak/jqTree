"use strict";
exports.__esModule = true;
var chai_1 = require("chai");
var node_1 = require("../src/node");
describe("constructor", function () {
    context("without parameters", function () {
        var node = new node_1.Node();
        it("creates a node", function () {
            chai_1.expect(node.name).to.eq("");
            chai_1.expect(node.id).to.be.undefined;
        });
    });
    context("with a string", function () {
        var node = new node_1.Node("n1");
        it("creates a node", function () {
            chai_1.expect(node.name).to.eq("n1");
            chai_1.expect(node.children).to.be.empty;
            chai_1.expect(node.parent).to.be["null"];
            chai_1.expect(node.id).to.be.undefined;
        });
    });
    context("with an object with a name property", function () {
        var node = new node_1.Node({
            id: 123,
            name: "n1"
        });
        it("creates a node", function () {
            chai_1.expect(node).to.include({
                id: 123,
                name: "n1"
            });
        });
    });
    context("when the name property is null", function () {
        var node = new node_1.Node({ name: null });
        it("sets the name to an empty string", function () {
            chai_1.expect(node.name).to.eq("");
        });
    });
    context("with an object with more properties", function () {
        var node = new node_1.Node({
            color: "green",
            id: 123,
            name: "n1",
            url: "/abc"
        });
        it("creates a node", function () {
            chai_1.expect(node).to.include({
                color: "green",
                id: 123,
                name: "n1",
                url: "/abc"
            });
        });
    });
    context("with an object with a label property", function () {
        var node = new node_1.Node({
            id: 123,
            label: "n1",
            url: "/"
        });
        it("creates a node", function () {
            chai_1.expect(node).to.include({
                id: 123,
                name: "n1",
                url: "/"
            });
            chai_1.expect(node).to.not.have.property("label");
            chai_1.expect(node.children).to.be.empty;
            chai_1.expect(node.parent).to.be["null"];
        });
    });
    context("with an object with a parent", function () {
        var node = new node_1.Node({
            name: "n1",
            parent: "abc"
        });
        it("doesn't set the parent", function () {
            chai_1.expect(node.name).to.eq("n1");
            chai_1.expect(node.parent).to.be["null"];
        });
    });
    context("with an object with children", function () {
        var node = new node_1.Node({
            name: "n1",
            children: ["c"]
        });
        it("doesn't set the children", function () {
            chai_1.expect(node.name).to.eq("n1");
            chai_1.expect(node.children).to.be.empty;
        });
    });
});
