$(function() {
    var data = [
        {
            name: 'examples',
            children: [
                { name: '<a href="example1.html">Example 1</a>' },
                { name: '<a href="example2.html">Example 2</a>' },
                '<a href="example3.html">Example 3</a>'
            ]
        }
    ];

    // set autoEscape to false
    $('#tree1').tree({
        data: data,
        autoEscape: false,
        autoOpen: true
    });
});
