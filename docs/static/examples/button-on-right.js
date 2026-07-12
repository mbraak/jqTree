mockServerWithDefaultData().then(() => {
    $("#tree1").tree({
        buttonLeft: false,
        autoOpen: 0,
        slide: true,
    });
});
