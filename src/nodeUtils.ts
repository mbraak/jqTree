interface NodeRecordWithChildren extends NodeRecord {
    children: NodeData[];
}

export const isNodeRecordWithChildren = (
    data: NodeData,
): data is NodeRecordWithChildren =>
    typeof data === "object" &&
    "children" in data &&
    data["children"] instanceof Array;
