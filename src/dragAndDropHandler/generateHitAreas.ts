import { HitArea } from "./types";
import { Node } from "../node";
import { Position } from "../position";
import { getOffsetTop } from "../util";
import iterateVisibleNodes from "./iterateVisibleNodes";

interface HitPosition {
    top: number;
    node: Node;
    position: Position;
}

export const generateHitPositions = (
    tree: Node,
    currentNode: Node,
): HitPosition[] => {
    const hitPositions: HitPosition[] = [];
    let lastTop = 0;

    const addHitPosition = (node: Node, position: number, top: number) => {
        hitPositions.push({
            top,
            node,
            position,
        });
        lastTop = top;
    };

    const handleAfterOpenFolder = (node: Node, nextNode: Node | null) => {
        if (node === currentNode || nextNode === currentNode) {
            // Cannot move before or after current item
            addHitPosition(node, Position.None, lastTop);
        } else {
            addHitPosition(node, Position.After, lastTop);
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
            addHitPosition(node, Position.None, top);
        } else {
            addHitPosition(node, Position.Inside, top);

            // Cannot move before current item
            if (nextNode !== currentNode) {
                addHitPosition(node, Position.After, top);
            }
        }
    };

    const handleFirstNode = (node: Node) => {
        if (node !== currentNode && node.element) {
            addHitPosition(node, Position.Before, getOffsetTop(node.element));
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
            addHitPosition(node, Position.None, top);
        } else {
            addHitPosition(node, Position.Inside, top);
        }

        if (nextNode === currentNode || node === currentNode) {
            // Cannot move before or after current item
            addHitPosition(node, Position.None, top);
        } else {
            addHitPosition(node, Position.After, top);
        }
    };

    const handleOpenFolder = (node: Node, element: HTMLElement) => {
        if (node === currentNode) {
            // Cannot move inside current item

            // Dnd over the current element is not possible: add a position with type None for the top and the bottom.
            const top = getOffsetTop(element);
            const height = element.clientHeight;
            addHitPosition(node, Position.None, top);

            if (height > 5) {
                // Subtract 5 pixels to allow more space for the next element.
                addHitPosition(node, Position.None, top + height - 5);
            }

            // Stop iterating
            return false;
        }

        // Cannot move before current item
        if (node.children[0] !== currentNode) {
            addHitPosition(node, Position.Inside, getOffsetTop(element));
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

    return hitPositions;
};

export const generateHitAreasForGroup = (
    hitAreas: HitArea[],
    positionsInGroup: HitPosition[],
    top: number,
    bottom: number,
) => {
    // limit positions in group
    const positionCount = Math.min(positionsInGroup.length, 4);

    const areaHeight = Math.round((bottom - top) / positionCount);
    let areaTop = top;

    for (let i = 0; i < positionCount; i++) {
        const position = positionsInGroup[i] as HitPosition;

        if (position.position !== Position.None) {
            hitAreas.push({
                top: areaTop,
                bottom: areaTop + areaHeight,
                node: position.node,
                position: position.position,
            });
        }

        areaTop += areaHeight;
    }
};

export const generateHitAreasFromPositions = (
    hitPositions: HitPosition[],
    treeBottom: number,
): HitArea[] => {
    if (!hitPositions.length) {
        return [];
    }

    let previousTop = (hitPositions[0] as HitPosition).top;
    let group: HitPosition[] = [];
    const hitAreas: HitArea[] = [];

    for (const position of hitPositions) {
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

const generateHitAreas = (tree: Node, currentNode: Node, treeBottom: number) =>
    generateHitAreasFromPositions(
        generateHitPositions(tree, currentNode),
        treeBottom,
    );

export default generateHitAreas;
