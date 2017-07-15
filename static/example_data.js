var ExampleData = {};

ExampleData.example_data = [
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
                            { name: "Avialans", id: 15 }
                        ]
                    }
                ]
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
                                    { name: "Titanosaurians", id: 22 }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
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
                    { name: "Stegosaurians", id: 27 }
                ]
            },
            {
                name: "Ornithopods",
                id: 28,
                children: [{ name: "Hadrosaurids", id: 29 }]
            },
            { name: "Pachycephalosaurians", id: 30 },
            { name: "Ceratopsians", id: 31 }
        ]
    }
];

ExampleData.getFirstLevelData = function(nodes) {
    if (!nodes) {
        nodes = ExampleData.example_data;
    }

    var data = [];

    $.each(nodes, function() {
        var node = {
            name: this.name,
            id: this.id
        };

        if (this.children) {
            node.load_on_demand = true;
        }

        data.push(node);
    });

    return data;
};

ExampleData.getChildrenOfNode = function(node_id) {
    var result = null;

    function iterate(nodes) {
        $.each(nodes, function() {
            if (result) {
                return;
            } else {
                if (this.id == node_id) {
                    result = this;
                }

                if (this.children) {
                    iterate(this.children);
                }
            }
        });
    }

    iterate(ExampleData.example_data);

    return ExampleData.getFirstLevelData(result.children);
};
