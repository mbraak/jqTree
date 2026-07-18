mockServerWithDefaultData().then(() => {
    const $tree = $("#tree1");
    $tree.tree({
        dragAndDrop: true,
        autoOpen: 0,
    });
});
