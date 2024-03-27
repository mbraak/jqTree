import {
    generateHitAreasForGroup,
    generateHitAreasFromPositions,
    generateHitPositions,
} from "../dragAndDropHandler/generateHitAreas";
import { HitArea } from "../dragAndDropHandler/types";
import { Node } from "../node";
import { Position } from "../position";

const mockHtmlElement = (y: number) =>
    ({
        clientHeight: 20,
        getBoundingClientRect: () => ({
            x: 10,
            y,
        }),
        offsetParent: {},
    }) as HTMLElement;

describe("generateHitAreasForGroup", () => {
    it("doesn't add a hit area with zero hit positions", () => {
        const hitAreas: HitArea[] = [];
        generateHitAreasForGroup(hitAreas, [], 0, 0);
        expect(hitAreas).toBeEmpty();
    });

    it("adds a hit area with one hit position", () => {
        const node = new Node(null);
        const hitPosition = {
            top: 0,
            node,
            position: Position.Inside,
        };

        const hitAreas: HitArea[] = [];
        generateHitAreasForGroup(hitAreas, [hitPosition], 40, 100);

        expect(hitAreas).toEqual([
            expect.objectContaining({
                bottom: 100,
                position: Position.Inside,
                node,
                top: 40,
            }),
        ]);
    });

    it("doesn't add a hit area when the position is Position.None", () => {
        const node = new Node(null);
        const hitPosition = {
            top: 0,
            node,
            position: Position.None,
        };

        const hitAreas: HitArea[] = [];
        generateHitAreasForGroup(hitAreas, [hitPosition], 0, 100);
        expect(hitAreas).toBeEmpty();
    });

    it("adds two hit areas with two hit positions", () => {
        const node = new Node(null);
        const hitPositions = [
            {
                top: 0,
                node,
                position: Position.Before,
            },
            {
                top: 0,
                node,
                position: Position.Inside,
            },
        ];

        const hitAreas: HitArea[] = [];
        generateHitAreasForGroup(hitAreas, hitPositions, 40, 100);

        expect(hitAreas).toEqual([
            expect.objectContaining({
                bottom: 70,
                position: Position.Before,
                node,
                top: 40,
            }),
            expect.objectContaining({
                bottom: 100,
                position: Position.Inside,
                node,
                top: 70,
            }),
        ]);
    });
});

describe("generateHitAreasFromPositions", () => {
    it("returns an empty array with no hit positions", () => {
        expect(generateHitAreasFromPositions([], 100)).toBeEmpty();
    });

    it("returns a hit area with one hit position", () => {
        const node = new Node(null);
        const hitPosition = {
            top: 100,
            node,
            position: Position.Inside,
        };

        expect(generateHitAreasFromPositions([hitPosition], 140)).toEqual([
            expect.objectContaining({
                bottom: 140,
                node,
                position: Position.Inside,
                top: 100,
            }),
        ]);
    });

    it("returns two hit areas with two hit positions with the same top", () => {
        const node = new Node(null);
        const hitPositions = [
            {
                top: 100,
                node,
                position: Position.Before,
            },
            {
                top: 100,
                node,
                position: Position.Inside,
            },
        ];

        expect(generateHitAreasFromPositions(hitPositions, 140)).toEqual([
            expect.objectContaining({
                bottom: 120,
                node,
                position: Position.Before,
                top: 100,
            }),
            expect.objectContaining({
                bottom: 140,
                node,
                position: Position.Inside,
                top: 120,
            }),
        ]);
    });

    it("returns two hit areas with two hit positions with a different top", () => {
        const node1 = new Node(null);
        const node2 = new Node(null);
        const hitPositions = [
            {
                top: 100,
                node: node1,
                position: Position.Inside,
            },
            {
                top: 125,
                node: node2,
                position: Position.After,
            },
        ];

        expect(generateHitAreasFromPositions(hitPositions, 140)).toEqual([
            expect.objectContaining({
                bottom: 125,
                node: node1,
                position: Position.Inside,
                top: 100,
            }),
            expect.objectContaining({
                bottom: 140,
                node: node2,
                position: Position.After,
                top: 125,
            }),
        ]);
    });
});

describe("generatePositions", () => {
    it("doesn't generate hit positions with an empty tree", () => {
        const tree = new Node(null);

        expect(generateHitPositions(tree, tree)).toBeEmpty();
    });

    it("generates hit positions when the tree has two nodes and the first node is the current node", () => {
        const tree = new Node().loadFromData([
            { name: "node1", id: 1 },
            { name: "node2", id: 2 },
        ]);

        const node1 = tree.children[0] as Node;
        const node2 = tree.children[1] as Node;

        node1.element = mockHtmlElement(100);
        node2.element = mockHtmlElement(120);

        expect(generateHitPositions(tree, node1)).toEqual([
            expect.objectContaining({
                node: node1,
                position: Position.None,
                top: 100,
            }),
            expect.objectContaining({
                node: node1,
                position: Position.None,
                top: 100,
            }),
            expect.objectContaining({
                node: node2,
                position: Position.Inside,
                top: 120,
            }),
            expect.objectContaining({
                node: node2,
                position: Position.After,
                top: 120,
            }),
        ]);
    });

    it("generates hit positions when the tree has a node and an open folder node and the first node is the current node", () => {
        const tree = new Node().loadFromData([
            { name: "node1", id: 1 },
            { name: "node2", id: 2, children: [{ name: "child1", id: 3 }] },
        ]);

        const node1 = tree.children[0] as Node;
        const node2 = tree.children[1] as Node;
        const child1 = node2.children[0] as Node;

        node1.element = mockHtmlElement(100);
        node2.element = mockHtmlElement(120);
        node2.is_open = true;

        child1.element = mockHtmlElement(140);

        expect(generateHitPositions(tree, node1)).toEqual([
            expect.objectContaining({
                node: node1,
                position: Position.None,
                top: 100,
            }),
            expect.objectContaining({
                node: node1,
                position: Position.None,
                top: 100,
            }),
            expect.objectContaining({
                node: node2,
                position: Position.Inside,
                top: 120,
            }),
            expect.objectContaining({
                node: child1,
                position: Position.Inside,
                top: 140,
            }),
            expect.objectContaining({
                node: child1,
                position: Position.After,
                top: 140,
            }),
            expect.objectContaining({
                node: node2,
                position: Position.After,
                top: 140,
            }),
        ]);
    });

    it("generates hit positions when the tree has a node and an open folder node and the folder node is the current node", () => {
        const tree = new Node().loadFromData([
            { name: "node1", id: 1 },
            { name: "node2", id: 2, children: [{ name: "child1", id: 3 }] },
        ]);

        const node1 = tree.children[0] as Node;
        const node2 = tree.children[1] as Node;
        const child1 = node2.children[0] as Node;

        node1.element = mockHtmlElement(100);
        node2.element = mockHtmlElement(120);
        node2.is_open = true;

        child1.element = mockHtmlElement(140);

        expect(generateHitPositions(tree, node2)).toEqual([
            expect.objectContaining({
                node: node1,
                position: Position.Before,
                top: 100,
            }),
            expect.objectContaining({
                node: node1,
                position: Position.Inside,
                top: 100,
            }),
            expect.objectContaining({
                node: node1,
                position: Position.None,
                top: 100,
            }),
            expect.objectContaining({
                node: node2,
                position: Position.None,
                top: 120,
            }),
            expect.objectContaining({
                node: node2,
                position: Position.None,
                top: 135,
            }),
        ]);
    });
});
