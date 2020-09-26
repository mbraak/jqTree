var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as $ from "jquery";
import getGiven from "givens";
import { screen } from "@testing-library/dom";
import * as mockjaxFactory from "jquery-mockjax";
import "../../tree.jquery";
import { togglerLink } from "../support/testUtil";
const mockjax = mockjaxFactory(jQuery, window);
const context = describe;
beforeEach(() => {
    $("body").append('<div id="tree1"></div>');
});
afterEach(() => {
    const $tree = $("#tree1");
    $tree.tree("destroy");
    $tree.remove();
    mockjax.clear();
    localStorage.clear();
});
context("when a node has load_on_demand in the data", () => {
    const given = getGiven();
    given("autoOpen", () => false);
    given("$tree", () => $("#tree1"));
    const initialData = [
        {
            id: 1,
            name: "parent-node",
            load_on_demand: true,
        },
    ];
    function handleResponse(settings) {
        expect(settings).toMatchObject({
            data: { node: 1 },
            method: "GET",
            url: "/tree/",
        });
        this.responseText = [{ id: 2, name: "loaded-on-demand" }];
    }
    beforeEach(() => {
        if (given.savedState) {
            localStorage.setItem("tree", given.savedState);
        }
        mockjax({
            url: "*",
            response: handleResponse,
            logging: false,
        });
        given.$tree.tree({
            autoOpen: given.autoOpen,
            data: initialData,
            dataUrl: "/tree/",
            saveState: true,
        });
    });
    it("creates a parent node without children", () => {
        expect(given.$tree).toHaveTreeStructure([
            expect.objectContaining({
                children: [],
                name: "parent-node",
                open: false,
            }),
        ]);
    });
    context("when the node is opened", () => {
        given("node", () => given.$tree.tree("getNodeByNameMustExist", "parent-node"));
        it("loads the subtree", () => __awaiter(void 0, void 0, void 0, function* () {
            togglerLink(given.node.element).click();
            yield screen.findByText("loaded-on-demand");
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "parent-node",
                    open: true,
                    children: [
                        expect.objectContaining({ name: "loaded-on-demand" }),
                    ],
                }),
            ]);
        }));
    });
    context("with autoOpen is true", () => {
        given("autoOpen", () => true);
        it("loads the node on demand", () => __awaiter(void 0, void 0, void 0, function* () {
            yield screen.findByText("loaded-on-demand");
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "parent-node",
                    open: true,
                    children: [
                        expect.objectContaining({ name: "loaded-on-demand" }),
                    ],
                }),
            ]);
        }));
    });
    context("with a saved state with an opened node", () => {
        given("savedState", () => '{"open_nodes":[1],"selected_node":[]}');
        it("opens the node and loads its children on demand", () => __awaiter(void 0, void 0, void 0, function* () {
            yield screen.findByText("loaded-on-demand");
            expect(given.$tree).toHaveTreeStructure([
                expect.objectContaining({
                    name: "parent-node",
                    open: true,
                    children: [
                        expect.objectContaining({ name: "loaded-on-demand" }),
                    ],
                }),
            ]);
        }));
    });
});
