const exampleData = [
    {
        children: [
            { id: 125, intProperty: 2, name: "child1" },
            { id: 126, name: "child2" },
        ],
        id: 123, // extra data
        intProperty: 1,
        name: "node1",
        strProperty: "1",
    },
    {
        children: [
            { children: [{ id: 128, name: "child3" }], id: 127, name: "node3" },
        ],
        id: 124,
        intProperty: 3,
        name: "node2",
        strProperty: "3",
    },
];

export default exampleData;
