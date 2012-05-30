var example_data = [
    {
        label: 'Saurischia',
        id: 1,
        children: [
            {label: 'Herrerasaurians', id: 2},
            {
                label: 'Theropods',
                id: 3,
                children: [
                    {label: 'Coelophysoids', id: 4},
                    {label: 'Ceratosaurians', id: 5},
                    {label: 'Spinosauroids', id: 6},
                    {label: 'Carnosaurians', id: 7},
                    {
                        label: 'Coelurosaurians',
                        id: 8,
                        children: [
                            {label: 'Tyrannosauroids', id: 9},
                            {label: 'Ornithomimosaurians', id: 10},
                            {label: 'Therizinosauroids', id: 11},
                            {label: 'Oviraptorosaurians', id: 12},
                            {label: 'Dromaeosaurids', id: 13},
                            {label: 'Troodontids', id: 14},
                            {label: 'Avialans', id: 15}
                        ]
                    }
                ]
            },
            {
                label: 'Sauropodomorphs',
                id: 16,
                children: [
                    {label: 'Prosauropods', id: 17},
                    {
                        label: 'Sauropods',
                        id: 18,
                        children: [
                            {label: 'Diplodocoids', id: 19},
                            {
                                label: 'Macronarians',
                                id: 20,
                                children: [
                                    {label: 'Brachiosaurids', id: 21},
                                    {label: 'Titanosaurians', id: 22}
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        label: 'Ornithischians',
        id: 23,
        children: [
            {label: 'Heterodontosaurids', id: 24},
            {
                label: 'Thyreophorans',
                id: 25,
                children: [
                    {label: 'Ankylosaurians', id: 26},
                    {label: 'Stegosaurians', id: 27}
                ]
            },
            {
                label: 'Ornithopods',
                id: 28,
                children: [
                    {label: 'Hadrosaurids', id: 29}
                ]
            },
            {label: 'Pachycephalosaurians', id: 30},
            {label: 'Ceratopsians', id: 31}
        ]
    }
];