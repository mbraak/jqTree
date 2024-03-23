import { HitArea } from "./types";
import { Node } from "../node";
import { Position } from "../position";
import { getOffsetTop } from "../util";
import iterateVisibleNodes from "./iterateVisibleNodes";

const generatePositions = (tree: Node, currentNode: Node): HitArea[] => {
    const positions: HitArea[] = [];
    let lastTop = 0;

    const addPosition = (node: Node, position: number, top: number) => {
        const area = {
            top,
            bottom: 0,
            node,
            position,
        };

        positions.push(area);
        lastTop = top;
    };

    const handleAfterOpenFolder = (node: Node, nextNode: Node | null) => {
        if (node === currentNode || nextNode === currentNode) {
            // Cannot move before or after current item
            addPosition(node, Position.None, lastTop);
        } else {
            addPosition(node, Position.After, lastTop);
        }
    };

    const handleClosedFolder = (
        node: Node,
        nextNode: Node | null,
        element: HTMLElement,
    ) => {
        const top = getOffsetTop(element);

        if (node === currentNode) {
            // Cannot move after current item
            addPosition(node, Position.None, top);
        } else {
            addPosition(node, Position.Inside, top);

            // Cannot move before current item
            if (nextNode !== currentNode) {
                addPosition(node, Position.After, top);
            }
        }
    };

    const handleFirstNode = (node: Node) => {
        if (node !== currentNode) {
            addPosition(node, Position.Before, getOffsetTop(node.element));
        }
    };

    const handleNode = (
        node: Node,
        nextNode: Node | null,
        element: HTMLElement,
    ) => {
        const top = getOffsetTop(element);

        if (node === currentNode) {
            // Cannot move inside current item
            addPosition(node, Position.None, top);
        } else {
            addPosition(node, Position.Inside, top);
        }

        if (nextNode === currentNode || node === currentNode) {
            // Cannot move before or after current item
            addPosition(node, Position.None, top);
        } else {
            addPosition(node, Position.After, top);
        }
    };

    const handleOpenFolder = (node: Node, element: HTMLElement) => {
        if (node === currentNode) {
            // Cannot move inside current item

            // Dnd over the current element is not possible: add a position with type None for the top and the bottom.
            const top = getOffsetTop(element);
            const height = element.clientHeight;
            addPosition(node, Position.None, top);

            if (height > 5) {
                // Subtract 5 pixels to allow more space for the next element.
                addPosition(node, Position.None, top + height - 5);
            }

            // Stop iterating
            return false;
        }

        // Cannot move before current item
        if (node.children[0] !== currentNode) {
            addPosition(node, Position.Inside, getOffsetTop(element));
        }

        // Continue iterating
        return true;
    };

    iterateVisibleNodes(tree, {
        handleAfterOpenFolder,
        handleClosedFolder,
        handleFirstNode,
        handleNode,
        handleOpenFolder,
    });

    return positions;
};

const generateHitAreasForGroup = (
    hitAreas: HitArea[],
    positionsInGroup: HitArea[],
    top: number,
    bottom: number,
) => {
    // limit positions in group
    const positionCount = Math.min(positionsInGroup.length, 4);

    const areaHeight = Math.round((bottom - top) / positionCount);
    let areaTop = top;

    let i = 0;
    while (i < positionCount) {
        const position = positionsInGroup[i];

        if (position && position.position !== Position.None) {
            hitAreas.push({
                top: areaTop,
                bottom: areaTop + areaHeight,
                node: position.node,
                position: position.position,
            });
        }

        areaTop += areaHeight;
        i += 1;
    }
};

const generateHitAreasFromPositions = (
    positions: HitArea[],
    treeBottom: number,
): HitArea[] => {
    let previousTop = positions[0]?.top ?? 0;
    let group = [];
    const hitAreas: HitArea[] = [];

    for (const position of positions) {
        if (position.top !== previousTop && group.length) {
            generateHitAreasForGroup(
                hitAreas,
                group,
                previousTop,
                position.top,
            );

            previousTop = position.top;
            group = [];
        }

        group.push(position);
    }

    generateHitAreasForGroup(hitAreas, group, previousTop, treeBottom);

    return hitAreas;
};

const generateHitAreas = (
    tree: Node,
    currentNode: Node,
    treeBottom: number,
) => {
    const positions = generatePositions(tree, currentNode);

    return generateHitAreasFromPositions(positions, treeBottom);
};

export default generateHitAreas;
