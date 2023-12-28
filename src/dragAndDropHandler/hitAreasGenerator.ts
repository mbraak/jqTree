import { HitArea } from "./types";
import { Node } from "../node";
import { Position } from "../position";
import { getOffsetTop } from "../util";
import iterateVisibleNodes from "./iterateVisibleNodes";

class HitAreasGenerator {
    private currentNode: Node;
    private lastTop: number;
    private positions: HitArea[];
    private tree: Node;
    private treeBottom: number;

    constructor(tree: Node, currentNode: Node, treeBottom: number) {
        this.currentNode = currentNode;
        this.tree = tree;
        this.treeBottom = treeBottom;
    }

    public generate(): HitArea[] {
        this.positions = [];
        this.lastTop = 0;

        iterateVisibleNodes(this.tree, {
            handleAfterOpenFolder: this.handleAfterOpenFolder.bind(this),
            handleClosedFolder: this.handleClosedFolder.bind(this),
            handleFirstNode: this.handleFirstNode.bind(this),
            handleNode: this.handleNode.bind(this),
            handleOpenFolder: this.handleOpenFolder.bind(this),
        });

        return this.generateHitAreas(this.positions);
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

    private handleOpenFolder(node: Node, element: HTMLElement): boolean {
        if (node === this.currentNode) {
            // Cannot move inside current item
            // Stop iterating
            return false;
        }

        // Cannot move before current item
        if (node.children[0] !== this.currentNode) {
            this.addPosition(node, Position.Inside, getOffsetTop(element));
        }

        // Continue iterating
        return true;
    }

    private handleClosedFolder(
        node: Node,
        nextNode: Node | null,
        element: HTMLElement,
    ): void {
        const top = getOffsetTop(element);

        if (node === this.currentNode) {
            // Cannot move after current item
            this.addPosition(node, Position.None, top);
        } else {
            this.addPosition(node, Position.Inside, top);

            // Cannot move before current item
            if (nextNode !== this.currentNode) {
                this.addPosition(node, Position.After, top);
            }
        }
    }

    private handleFirstNode(node: Node): void {
        if (node !== this.currentNode) {
            this.addPosition(node, Position.Before, getOffsetTop(node.element));
        }
    }

    private handleAfterOpenFolder(node: Node, nextNode: Node | null): void {
        if (node === this.currentNode || nextNode === this.currentNode) {
            // Cannot move before or after current item
            this.addPosition(node, Position.None, this.lastTop);
        } else {
            this.addPosition(node, Position.After, this.lastTop);
        }
    }

    private handleNode(
        node: Node,
        nextNode: Node | null,
        element: HTMLElement,
    ): void {
        const top = getOffsetTop(element);

        if (node === this.currentNode) {
            // Cannot move inside current item
            this.addPosition(node, Position.None, top);
        } else {
            this.addPosition(node, Position.Inside, top);
        }

        if (nextNode === this.currentNode || node === this.currentNode) {
            // Cannot move before or after current item
            this.addPosition(node, Position.None, top);
        } else {
            this.addPosition(node, Position.After, top);
        }
    }

    private addPosition(node: Node, position: number, top: number): void {
        const area = {
            top,
            bottom: 0,
            node,
            position,
        };

        this.positions.push(area);
        this.lastTop = top;
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
