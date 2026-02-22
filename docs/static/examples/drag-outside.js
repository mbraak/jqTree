$.ajax = function (settings) {
    settings.success(ExampleData.exampleData);
};

var targetCollisionDiv = $("#targetDiv");

function isOverTarget(e) {
    return (
        e.clientX > targetCollisionDiv.position().left &&
        e.clientX <
            targetCollisionDiv.position().left + targetCollisionDiv.width() &&
        e.clientY > targetCollisionDiv.position().top &&
        e.clientY <
            targetCollisionDiv.position().top + targetCollisionDiv.height()
    );
}

function handleMove(node, e) {
    if (isOverTarget(e)) {
        console.log("the node is over the target div");
    }
}

function handleStop(node, e) {
    console.log("stopped over target: ", isOverTarget(e));
}

$("#tree1").tree({
    dragAndDrop: true,
    onDragMove: handleMove,
    onDragStop: handleStop,
});
