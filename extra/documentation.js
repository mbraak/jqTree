$(function() {
    var $menu = $('#menu');
    var $body = $('body');
    var $h1 = $('#jqtree h1');

    // title
    $h1.html("<span class=\"first\">jq</span><span class=\"second\">Tree</span>")

    // menu
    $menu.affix({
        offset: {
            top: $menu.offset().top,
            bottom: 0
        }
    });

    // demo tree
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

    // code styling
    Prism.highlightAll(
        false,
        function() {
            $body.scrollspy({
                target: '#menu'
            });
        }
    );
});
