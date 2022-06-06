const ExampleData = {};

ExampleData.exampleData = [
    {
        name: "Saurischia",
        id: 1,
        children: [
            { name: "Herrerasaurians", id: 2 },
            {
                name: "Theropods",
                id: 3,
                children: [
                    { name: "Coelophysoids", id: 4 },
                    { name: "Ceratosaurians", id: 5 },
                    { name: "Spinosauroids", id: 6 },
                    { name: "Carnosaurians", id: 7 },
                    {
                        name: "Coelurosaurians",
                        id: 8,
                        children: [
                            { name: "Tyrannosauroids", id: 9 },
                            { name: "Ornithomimosaurians", id: 10 },
                            { name: "Therizinosauroids", id: 11 },
                            { name: "Oviraptorosaurians", id: 12 },
                            { name: "Dromaeosaurids", id: 13 },
                            { name: "Troodontids", id: 14 },
                            { name: "Avialans", id: 15 },
                        ],
                    },
                ],
            },
            {
                name: "Sauropodomorphs",
                id: 16,
                children: [
                    { name: "Prosauropods", id: 17 },
                    {
                        name: "Sauropods",
                        id: 18,
                        children: [
                            { name: "Diplodocoids", id: 19 },
                            {
                                name: "Macronarians",
                                id: 20,
                                children: [
                                    { name: "Brachiosaurids", id: 21 },
                                    { name: "Titanosaurians", id: 22 },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        name: "Ornithischians",
        id: 23,
        children: [
            { name: "Heterodontosaurids", id: 24 },
            {
                name: "Thyreophorans",
                id: 25,
                children: [
                    { name: "Ankylosaurians", id: 26 },
                    { name: "Stegosaurians", id: 27 },
                ],
            },
            {
                name: "Ornithopods",
                id: 28,
                children: [{ name: "Hadrosaurids", id: 29 }],
            },
            { name: "Pachycephalosaurians", id: 30 },
            { name: "Ceratopsians", id: 31 },
        ],
    },
];

ExampleData.getFirstLevelData = function (nodes) {
    if (!nodes) {
        nodes = ExampleData.exampleData;
    }

    const data = [];

    nodes.forEach(function (node) {
        const newNode = { id: node.id, name: node.name };

        if (node.children) {
            newNode.load_on_demand = true;
        }

        data.push(newNode);
    });

    return data;
};

ExampleData.getChildrenOfNode = function (nodeId) {
    let result = null;

    function iterate(nodes) {
        nodes.forEach(function (node) {
            if (result) {
                return;
            } else {
                if (node.id == nodeId) {
                    result = node;
                }

                if (node.children) {
                    iterate(node.children);
                }
            }
        });
    }

    iterate(ExampleData.exampleData);

    return ExampleData.getFirstLevelData(result.children);
};
