const $tree = $("#tree1");

let foundMatch = false;

$tree.tree({
    autoOpen: false,
    data: ExampleData.exampleData,
    useContextMenu: false,
    onCreateLi: (node, $el) => {
        if (foundMatch && !node.openForMatch && !node.parent.matches) {
            $el.addClass("hidden-node");
        }

        if (node.matches) {
            $el.addClass("highlight-node");
        }
    },
});

$("#search").on("click", () => {
    const searchTerm = $("#search-term").val().toLowerCase();
    const tree = $tree.tree("getTree");

    if (!searchTerm) {
        foundMatch = false;

        tree.iterate((node) => {
            node["openForMatch"] = false;
            node["matches"] = false;
            return true;
        });

        $tree.tree("refresh");
        return;
    }

    foundMatch = false;

    tree.iterate((node) => {
        const matches = node.name.toLowerCase().includes(searchTerm);
        node["openForMatch"] = matches;
        node["matches"] = matches;

        if (matches) {
            foundMatch = true;

            if (node.isFolder()) {
                node.is_open = true;
            }

            let parent = node.parent;
            while (parent) {
                parent["openForMatch"] = true;
                parent.is_open = true;
                parent = parent.parent;
            }
        }

        return true;
    });

    $tree.tree("refresh");
});
