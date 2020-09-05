declare module "jquery-mockjax" {
    function mockjaxFactory(
        jQuery: JQueryStatic,
        window: Window
    ): MockJaxStatic;
    namespace mockjaxFactory {}

    export = mockjaxFactory;
}
