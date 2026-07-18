mockServerWithDefaultData().then(() => {
    const $tree = $("#tree1");
    $tree.tree({
        saveState: true,
    });
});
