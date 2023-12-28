import { HitArea } from "./types";
import { Node } from "../node";
import { Position } from "../position";
import { getOffsetTop } from "../util";
import iterateVisibleNodes from "./iterateVisibleNodes";

class HitAreasGenerator {
    private currentNode: Node;
    private tree: Node;
    private treeBottom: number;

    constructor(tree: Node, currentNode: Node, treeBottom: number) {
        this.currentNode = currentNode;
        this.tree = tree;
        this.treeBottom = treeBottom;
    }

    public generate(): HitArea[] {
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
            if (node === this.currentNode || nextNode === this.currentNode) {
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

            if (node === this.currentNode) {
                // Cannot move after current item
                addPosition(node, Position.None, top);
            } else {
                addPosition(node, Position.Inside, top);

                // Cannot move before current item
                if (nextNode !== this.currentNode) {
                    addPosition(node, Position.After, top);
                }
            }
        };

        const handleFirstNode = (node: Node) => {
            if (node !== this.currentNode) {
                addPosition(node, Position.Before, getOffsetTop(node.element));
            }
        };

        const handleNode = (
            node: Node,
            nextNode: Node | null,
            element: HTMLElement,
        ) => {
            const top = getOffsetTop(element);

            if (node === this.currentNode) {
                // Cannot move inside current item
                addPosition(node, Position.None, top);
            } else {
                addPosition(node, Position.Inside, top);
            }

            if (nextNode === this.currentNode || node === this.currentNode) {
                // Cannot move before or after current item
                addPosition(node, Position.None, top);
            } else {
                addPosition(node, Position.After, top);
            }
        };

        const handleOpenFolder = (node: Node, element: HTMLElement) => {
            if (node === this.currentNode) {
                // Cannot move inside current item
                // Stop iterating
                return false;
            }

            // Cannot move before current item
            if (node.children[0] !== this.currentNode) {
                addPosition(node, Position.Inside, getOffsetTop(element));
            }

            // Continue iterating
            return true;
        };

        iterateVisibleNodes(this.tree, {
            handleAfterOpenFolder,
            handleClosedFolder,
            handleFirstNode,
            handleNode,
            handleOpenFolder,
        });

        return this.generateHitAreas(positions);
    }

    private generateHitAreas(positions: HitArea[]): HitArea[] {
        let previousTop = positions[0]?.top ?? 0;
        let group = [];
        const hitAreas: HitArea[] = [];

        for (const position of positions) {
            if (position.top !== previousTop && group.length) {
                this.generateHitAreasForGroup(
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

        this.generateHitAreasForGroup(
            hitAreas,
            group,
            previousTop,
            this.treeBottom,
        );

        return hitAreas;
    }

    private generateHitAreasForGroup(
        hitAreas: HitArea[],
        positionsInGroup: HitArea[],
        top: number,
        bottom: number,
    ): void {
        // limit positions in group
        const positionCount = Math.min(positionsInGroup.length, 4);

        const areaHeight = Math.round((bottom - top) / positionCount);
        let areaTop = top;

        let i = 0;
        while (i < positionCount) {
            const position = positionsInGroup[i];

            if (position) {
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
    }
}

export default HitAreasGenerator;
