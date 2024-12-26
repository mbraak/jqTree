import { Node, Position } from "../node";
import { getOffsetTop } from "../util";
import iterateVisibleNodes from "./iterateVisibleNodes";
import { HitArea } from "./types";

interface HitPosition {
    node: Node;
    position: Position;
    top: number;
}

export const generateHitPositions = (
    tree: Node,
    currentNode: Node,
): HitPosition[] => {
    const hitPositions: HitPosition[] = [];
    let lastTop = 0;

    const addHitPosition = (node: Node, position: Position, top: number) => {
        hitPositions.push({
            node,
            position,
            top,
        });
        lastTop = top;
    };

    const handleAfterOpenFolder = (node: Node, nextNode: Node | null) => {
        if (node === currentNode || nextNode === currentNode) {
            // Cannot move before or after current item
            addHitPosition(node, "none", lastTop);
        } else {
            addHitPosition(node, "after", lastTop);
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
            addHitPosition(node, "none", top);
        } else {
            addHitPosition(node, "inside", top);

            // Cannot move before current item
            if (nextNode !== currentNode) {
                addHitPosition(node, "after", top);
            }
        }
    };

    const handleFirstNode = (node: Node) => {
        if (node !== currentNode && node.element) {
            addHitPosition(node, "before", getOffsetTop(node.element));
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
            addHitPosition(node, "none", top);
        } else {
            addHitPosition(node, "inside", top);
        }

        if (nextNode === currentNode || node === currentNode) {
            // Cannot move before or after current item
            addHitPosition(node, "none", top);
        } else {
            addHitPosition(node, "after", top);
        }
    };

    const handleOpenFolder = (node: Node, element: HTMLElement) => {
        if (node === currentNode) {
            // Cannot move inside current item

            // Dnd over the current element is not possible: add a position with type None for the top and the bottom.
            const top = getOffsetTop(element);
            const height = element.clientHeight;
            addHitPosition(node, "none", top);

            if (height > 5) {
                // Subtract 5 pixels to allow more space for the next element.
                addHitPosition(node, "none", top + height - 5);
            }

            // Stop iterating
            return false;
        }

        // Cannot move before current item
        if (node.children[0] !== currentNode) {
            addHitPosition(node, "inside", getOffsetTop(element));
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

        if (position.position !== "none") {
            hitAreas.push({
                bottom: areaTop + areaHeight,
                node: position.node,
                position: position.position,
                top: areaTop,
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
