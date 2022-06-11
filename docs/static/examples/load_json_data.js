$(function() {
    var data = [
        {
            name: "node1",
            id: 1,
            children: [{ name: "child1", id: 2 }, { name: "child2", id: 3 }]
        },
        {
            name: "node2",
            id: 4,
            children: [{ name: "child3", id: 5 }]
        }
    ];

    $("#tree1").tree({
        data: data
    });
});
