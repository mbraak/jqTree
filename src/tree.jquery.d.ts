interface IJQTreePlugin {
    (behavior: "destroy"): void;
    (behavior: "toJson"): any;
}

// tslint:disable-next-line: interface-name
interface JQuery {
    tree: IJQTreePlugin;
}
