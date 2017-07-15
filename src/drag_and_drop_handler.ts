import { Position, Node, getPositionName } from "./node";
import { html_escape } from "./util";
import { ITreeWidget, IHitArea, INodeElement, IDropHint } from "./itree_widget";
import { IPositionInfo } from "./imouse_widget";

export class DragAndDropHandler {
    public hit_areas: IHitArea[];
    public is_dragging: boolean;
    public current_item: INodeElement | null;
    public hovered_area: IHitArea | null;

    private tree_widget: ITreeWidget;
    private $ghost: JQuery | null;
    private drag_element: DragElement | null;
    private previous_ghost: IDropHint | null;
    private open_folder_timer: number | null;

    constructor(tree_widget: ITreeWidget) {
        this.tree_widget = tree_widget;

        this.hovered_area = null;
        this.$ghost = null;
        this.hit_areas = [];
        this.is_dragging = false;
        this.current_item = null;
    }

    public mouseCapture(position_info: IPositionInfo): boolean | null {
        const $element = $(position_info.target);

        if (!this.mustCaptureElement($element)) {
            return null;
        }

        if (
            this.tree_widget.options.onIsMoveHandle &&
            !this.tree_widget.options.onIsMoveHandle($element)
        ) {
            return null;
        }

        let node_element = this.tree_widget._getNodeElement($element);

        if (node_element && this.tree_widget.options.onCanMove) {
            if (!this.tree_widget.options.onCanMove(node_element.node)) {
                node_element = null;
            }
        }

        this.current_item = node_element;
        return this.current_item != null;
    }

    public generateHitAreas() {
        if (!this.current_item) {
            this.hit_areas = [];
        } else {
            const hit_areas_generator = new HitAreasGenerator(
                this.tree_widget.tree,
                this.current_item.node,
                this.getTreeDimensions().bottom
            );
            this.hit_areas = hit_areas_generator.generate();
        }
    }

    public mouseStart(position_info: IPositionInfo): boolean {
        if (!this.current_item) {
            return false;
        } else {
            this.refresh();

            const offset = $(position_info.target).offset();

            const node = this.current_item.node;

            const node_name: string = this.tree_widget.options.autoEscape
                ? html_escape(node.name)
                : node.name;

            this.drag_element = new DragElement(
                node_name,
                position_info.page_x - offset.left,
                position_info.page_y - offset.top,
                this.tree_widget.element
            );

            this.is_dragging = true;
            this.current_item.$element.addClass("jqtree-moving");
            return true;
        }
    }

    public mouseDrag(position_info: IPositionInfo): boolean {
        if (!this.current_item || !this.drag_element) {
            return false;
        } else {
            this.drag_element.move(position_info.page_x, position_info.page_y);

            const area = this.findHoveredArea(
                position_info.page_x,
                position_info.page_y
            );
            const can_move_to = this.canMoveToArea(area);

            if (can_move_to && area) {
                if (!area.node.isFolder()) {
                    this.stopOpenFolderTimer();
                }

                if (this.hovered_area !== area) {
                    this.hovered_area = area;

                    // If this is a closed folder, start timer to open it
                    if (this.mustOpenFolderTimer(area)) {
                        this.startOpenFolderTimer(area.node);
                    } else {
                        this.stopOpenFolderTimer();
                    }

                    this.updateDropHint();
                }
            } else {
                this.removeHover();
                this.removeDropHint();
                this.stopOpenFolderTimer();
            }

            if (!area) {
                if (this.tree_widget.options.onDragMove) {
                    this.tree_widget.options.onDragMove(
                        this.current_item.node,
                        position_info.original_event
                    );
                }
            }

            return true;
        }
    }

    public mouseStop(position_info: IPositionInfo) {
        this.moveItem(position_info);
        this.clear();
        this.removeHover();
        this.removeDropHint();
        this.removeHitAreas();

        const current_item = this.current_item;

        if (this.current_item) {
            this.current_item.$element.removeClass("jqtree-moving");
            this.current_item = null;
        }

        this.is_dragging = false;

        if (!this.hovered_area && current_item) {
            if (this.tree_widget.options.onDragStop) {
                this.tree_widget.options.onDragStop(
                    current_item.node,
                    position_info.original_event
                );
            }
        }

        return false;
    }

    public refresh() {
        this.removeHitAreas();

        if (this.current_item) {
            this.generateHitAreas();

            this.current_item = this.tree_widget._getNodeElementForNode(
                this.current_item.node
            );

            if (this.is_dragging) {
                this.current_item.$element.addClass("jqtree-moving");
            }
        }
    }

    private mustCaptureElement($element: JQuery) {
        return !$element.is("input,select,textarea");
    }

    private canMoveToArea(area: IHitArea | null): boolean {
        if (!area || !this.current_item) {
            return false;
        } else if (this.tree_widget.options.onCanMoveTo) {
            const position_name = getPositionName(area.position);

            return this.tree_widget.options.onCanMoveTo(
                this.current_item.node,
                area.node,
                position_name
            );
        } else {
            return true;
        }
    }

    private removeHitAreas() {
        this.hit_areas = [];
    }

    private clear() {
        if (this.drag_element) {
            this.drag_element.remove();
            this.drag_element = null;
        }
    }

    private removeDropHint() {
        if (this.previous_ghost) {
            this.previous_ghost.remove();
        }
    }

    private removeHover() {
        this.hovered_area = null;
    }

    private findHoveredArea(x: number, y: number): IHitArea | null {
        const dimensions = this.getTreeDimensions();

        if (
            x < dimensions.left ||
            y < dimensions.top ||
            x > dimensions.right ||
            y > dimensions.bottom
        ) {
            return null;
        }

        let low = 0;
        let high = this.hit_areas.length;
        while (low < high) {
            // tslint:disable-next-line: no-bitwise
            const mid = (low + high) >> 1;
            const area = this.hit_areas[mid];

            if (y < area.top) {
                high = mid;
            } else if (y > area.bottom) {
                low = mid + 1;
            } else {
                return area;
            }
        }

        return null;
    }

    private mustOpenFolderTimer(area: IHitArea) {
        const node = area.node;

        return (
            node.isFolder() &&
            !node.is_open &&
            area.position === Position.Inside
        );
    }

    private updateDropHint() {
        if (!this.hovered_area) {
            return;
        }

        // remove previous drop hint
        this.removeDropHint();

        // add new drop hint
        const node_element = this.tree_widget._getNodeElementForNode(
            this.hovered_area.node
        );
        this.previous_ghost = node_element.addDropHint(
            this.hovered_area.position
        );
    }

    private startOpenFolderTimer(folder: Node) {
        const openFolder = () => {
            this.tree_widget._openNode(
                folder,
                this.tree_widget.options.slide,
                () => {
                    this.refresh();
                    this.updateDropHint();
                }
            );
        };

        this.stopOpenFolderTimer();

        this.open_folder_timer = setTimeout(
            openFolder,
            this.tree_widget.options.openFolderDelay
        );
    }

    private stopOpenFolderTimer() {
        if (this.open_folder_timer) {
            clearTimeout(this.open_folder_timer);
            this.open_folder_timer = null;
        }
    }

    private moveItem(position_info: IPositionInfo) {
        if (
            this.current_item &&
            this.hovered_area &&
            this.hovered_area.position !== Position.None &&
            this.canMoveToArea(this.hovered_area)
        ) {
            const moved_node = this.current_item.node;
            const target_node = this.hovered_area.node;
            const position = this.hovered_area.position;
            const previous_parent = moved_node.parent;

            if (position === Position.Inside) {
                this.hovered_area.node.is_open = true;
            }

            const doMove = () => {
                this.tree_widget.tree.moveNode(
                    moved_node,
                    target_node,
                    position
                );
                this.tree_widget.element.empty();
                this.tree_widget._refreshElements(null);
            };

            const event = this.tree_widget._triggerEvent("tree.move", {
                move_info: {
                    moved_node,
                    target_node,
                    position: getPositionName(position),
                    previous_parent,
                    do_move: doMove,
                    original_event: position_info.original_event
                }
            });

            if (!event.isDefaultPrevented()) {
                doMove();
            }
        }
    }

    private getTreeDimensions() {
        // Return the dimensions of the tree. Add a margin to the bottom to allow
        // for some to drag-and-drop the last element.
        const offset = this.tree_widget.element.offset();

        return {
            left: offset.left,
            top: offset.top,
            right: offset.left + this.tree_widget.element.width(),
            bottom: offset.top + this.tree_widget.element.height() + 16
        };
    }
}

abstract class VisibleNodeIterator {
    private tree: Node;

    constructor(tree: Node) {
        this.tree = tree;
    }

    protected iterate() {
        let is_first_node = true;

        const _iterateNode = (node: Node, next_node: Node | null) => {
            let must_iterate_inside =
                (node.is_open || !node.element) && node.hasChildren();

            let $element: JQuery | null = null;

            if (node.element) {
                $element = $(node.element);

                if (!$element.is(":visible")) {
                    return;
                }

                if (is_first_node) {
                    this.handleFirstNode(node);
                    is_first_node = false;
                }

                if (!node.hasChildren()) {
                    this.handleNode(node, next_node, $element);
                } else if (node.is_open) {
                    if (!this.handleOpenFolder(node, $element)) {
                        must_iterate_inside = false;
                    }
                } else {
                    this.handleClosedFolder(node, next_node, $element);
                }
            }

            if (must_iterate_inside) {
                const children_length = node.children.length;
                node.children.forEach((_, i) => {
                    if (i === children_length - 1) {
                        _iterateNode(node.children[i], null);
                    } else {
                        _iterateNode(node.children[i], node.children[i + 1]);
                    }
                });

                if (node.is_open && $element) {
                    this.handleAfterOpenFolder(node, next_node);
                }
            }
        };

        _iterateNode(this.tree, null);
    }

    protected abstract handleNode(
        node: Node,
        next_node: Node | null,
        $element: JQuery
    ): void;

    /*
    override
    return
        - true: continue iterating
        - false: stop iterating
    */
    protected abstract handleOpenFolder(node: Node, $element: JQuery): boolean;

    protected abstract handleClosedFolder(
        node: Node,
        next_node: Node | null,
        $element: JQuery
    ): void;

    protected abstract handleAfterOpenFolder(
        node: Node,
        next_node: Node | null
    ): void;

    protected abstract handleFirstNode(node: Node): void;
}

export class HitAreasGenerator extends VisibleNodeIterator {
    private current_node: Node;
    private tree_bottom: number;
    private positions: IHitArea[];
    private last_top: number;

    constructor(tree: Node, current_node: Node, tree_bottom: number) {
        super(tree);

        this.current_node = current_node;
        this.tree_bottom = tree_bottom;
    }

    public generate() {
        this.positions = [];
        this.last_top = 0;

        this.iterate();

        return this.generateHitAreas(this.positions);
    }

    protected generateHitAreas(positions: IHitArea[]) {
        let previous_top = -1;
        let group = [];
        const hit_areas: IHitArea[] = [];

        for (const position of positions) {
            if (position.top !== previous_top && group.length) {
                if (group.length) {
                    this.generateHitAreasForGroup(
                        hit_areas,
                        group,
                        previous_top,
                        position.top
                    );
                }

                previous_top = position.top;
                group = [];
            }

            group.push(position);
        }

        this.generateHitAreasForGroup(
            hit_areas,
            group,
            previous_top,
            this.tree_bottom
        );

        return hit_areas;
    }

    protected handleOpenFolder(node: Node, $element: JQuery) {
        if (node === this.current_node) {
            // Cannot move inside current item
            // Stop iterating
            return false;
        }

        // Cannot move before current item
        if (node.children[0] !== this.current_node) {
            this.addPosition(node, Position.Inside, this.getTop($element));
        }

        // Continue iterating
        return true;
    }

    protected handleClosedFolder(
        node: Node,
        next_node: Node,
        $element: JQuery
    ) {
        const top = this.getTop($element);

        if (node === this.current_node) {
            // Cannot move after current item
            this.addPosition(node, Position.None, top);
        } else {
            this.addPosition(node, Position.Inside, top);

            // Cannot move before current item
            if (next_node !== this.current_node) {
                this.addPosition(node, Position.After, top);
            }
        }
    }

    protected handleFirstNode(node: Node) {
        if (node !== this.current_node) {
            this.addPosition(
                node,
                Position.Before,
                this.getTop($(node.element))
            );
        }
    }

    protected handleAfterOpenFolder(node: Node, next_node: Node) {
        if (node === this.current_node || next_node === this.current_node) {
            // Cannot move before or after current item
            this.addPosition(node, Position.None, this.last_top);
        } else {
            this.addPosition(node, Position.After, this.last_top);
        }
    }

    protected handleNode(node: Node, next_node: Node, $element: JQuery) {
        const top = this.getTop($element);

        if (node === this.current_node) {
            // Cannot move inside current item
            this.addPosition(node, Position.None, top);
        } else {
            this.addPosition(node, Position.Inside, top);
        }

        if (next_node === this.current_node || node === this.current_node) {
            // Cannot move before or after current item
            this.addPosition(node, Position.None, top);
        } else {
            this.addPosition(node, Position.After, top);
        }
    }

    private getTop($element: JQuery): number {
        return $element.offset().top;
    }

    private addPosition(node: Node, position: number, top: number) {
        const area = {
            top,
            bottom: 0,
            node,
            position
        };

        this.positions.push(area);
        this.last_top = top;
    }

    private generateHitAreasForGroup(
        hit_areas: IHitArea[],
        positions_in_group: IHitArea[],
        top: number,
        bottom: number
    ) {
        // limit positions in group
        const position_count = Math.min(positions_in_group.length, 4);

        const area_height = Math.round((bottom - top) / position_count);
        let area_top = top;

        let i = 0;
        while (i < position_count) {
            const position = positions_in_group[i];

            hit_areas.push({
                top: area_top,
                bottom: area_top + area_height,
                node: position.node,
                position: position.position
            });

            area_top += area_height;
            i += 1;
        }
    }
}

export class DragElement {
    private offset_x: number;
    private offset_y: number;
    private $element: JQuery;

    constructor(
        node_name: string,
        offset_x: number,
        offset_y: number,
        $tree: JQuery
    ) {
        this.offset_x = offset_x;
        this.offset_y = offset_y;

        this.$element = $(
            `<span class=\"jqtree-title jqtree-dragging\">${node_name}</span>`
        );
        this.$element.css("position", "absolute");
        $tree.append(this.$element);
    }

    public move(page_x: number, page_y: number) {
        this.$element.offset({
            left: page_x - this.offset_x,
            top: page_y - this.offset_y
        });
    }

    public remove() {
        this.$element.remove();
    }
}
