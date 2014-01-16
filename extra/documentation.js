$(function() {
    var $menu = $('#menu');
    var $body = $('body');

    $menu.affix({
        offset: {
            top: $menu.offset().top,
            bottom: 0
        }
    });

    var data = [
        {
            label: 'node1',
            children: [
                { label: 'child1' },
                { label: 'child2' }
            ]
        },
        {
            label: 'node2',
            children: [
                { label: 'child3' }
            ]
        }
    ];

    var $tree1 = $('#tree1');

    $tree1.tree({
        data: data,
        autoOpen: true,
        dragAndDrop: true
    });

    Prism.highlightAll(
        false,
        function() {
            $body.scrollspy({
                target: '#menu'
            });
        }
    );
});
