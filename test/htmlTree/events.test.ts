import { screen, waitFor } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { vi } from "vitest";

import type { HtmlTreeOptions } from "app/htmlTree/options";

import HtmlTree from "app/htmlTree";

import exampleData from "../support/exampleData";

describe("events", () => {
  let htmlElement: HTMLElement;
  let htmlTree: HtmlTree | undefined;

  const createHtmlTree = (options: Partial<HtmlTreeOptions> = {}) => {
    htmlTree = new HtmlTree({ htmlElement, options });

    return htmlTree;
  };

  // Listen to a tree event; the listener is called with the values of the event.
  const listenToEvent = (eventName: string) => {
    const listener = vi.fn();

    htmlElement.addEventListener(eventName, (e) => {
      listener((e as CustomEvent).detail);
    });

    return listener;
  };

  beforeEach(() => {
    document.body.innerHTML = "";

    htmlElement = document.createElement("div");
    document.body.append(htmlElement);
  });

  afterEach(() => {
    htmlTree?.deinit();
    htmlTree = undefined;

    document.body.innerHTML = "";
  });

  describe("tree.click", () => {
    it("fires tree.click", async () => {
      const tree = createHtmlTree({ data: exampleData });

      const onClick = listenToEvent("tree.click");

      await userEvent.click(screen.getByRole("treeitem", { name: "node1" }));

      const node1 = tree.getNodeByNameMustExist("node1");

      expect(onClick).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ node: node1 }),
      );
    });

    it("doesn't select the node when the event is cancelled", async () => {
      const tree = createHtmlTree({ data: exampleData });

      htmlElement.addEventListener("tree.click", (e) => {
        e.preventDefault();
      });

      await userEvent.click(screen.getByRole("treeitem", { name: "node1" }));

      expect(tree.getSelectedNode()).toBeFalse();
    });
  });

  describe("tree.contextmenu", () => {
    it("fires tree.contextmenu", async () => {
      const tree = createHtmlTree({ data: exampleData });

      const onContextMenu = listenToEvent("tree.contextmenu");

      await userEvent.pointer({
        keys: "[MouseRight]",
        target: screen.getByRole("treeitem", { name: "node1" }),
      });

      const node1 = tree.getNodeByNameMustExist("node1");

      expect(onContextMenu).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ node: node1 }),
      );
    });
  });

  describe("tree.dblclick", () => {
    it("fires tree.dblclick", async () => {
      const tree = createHtmlTree({ data: exampleData });

      const onDoubleClick = listenToEvent("tree.dblclick");

      await userEvent.dblClick(
        screen.getByRole("treeitem", { name: "node1" }),
      );

      const node1 = tree.getNodeByNameMustExist("node1");

      expect(onDoubleClick).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ node: node1 }),
      );
    });
  });

  describe("tree.init", () => {
    it("is called with json data", () => {
      const onInit = listenToEvent("tree.init");

      createHtmlTree({ data: exampleData });

      expect(onInit).toHaveBeenCalledExactlyOnceWith(null);
    });

    describe("with data loaded from an url", () => {
      const server = setupServer(
        http.get("/tree/", () => HttpResponse.json(exampleData)),
      );

      beforeEach(() => {
        server.listen();
      });

      afterAll(() => {
        server.close();
      });

      it("is called", async () => {
        const onInit = listenToEvent("tree.init");

        createHtmlTree({ dataUrl: "/tree/" });

        await waitFor(() => {
          expect(onInit).toHaveBeenCalledExactlyOnceWith(null);
        });
      });
    });
  });

  describe("tree.load_data", () => {
    it("fires tree.load_data when the tree is initialized with data", () => {
      const onLoadData = listenToEvent("tree.load_data");

      createHtmlTree({ data: exampleData });

      expect(onLoadData).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ tree_data: exampleData }),
      );
    });
  });

  describe("tree.select", () => {
    it("fires tree.select", async () => {
      const tree = createHtmlTree({ data: exampleData });

      const onSelect = listenToEvent("tree.select");

      await userEvent.click(screen.getByRole("treeitem", { name: "node1" }));

      const node1 = tree.getNodeByNameMustExist("node1");

      expect(onSelect).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          deselected_node: null,
          node: node1,
        }),
      );
    });

    it("fires tree.select with node is null when the node was selected", async () => {
      const tree = createHtmlTree({ data: exampleData });

      const node1 = tree.getNodeByNameMustExist("node1");
      tree.selectNode(node1);

      const onSelect = listenToEvent("tree.select");

      await userEvent.click(screen.getByRole("treeitem", { name: "node1" }));

      expect(onSelect).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          node: null,
          previous_node: node1,
        }),
      );
    });
  });

  describe("tree.open and tree.close", () => {
    it("fires tree.open when a node is opened", () => {
      const tree = createHtmlTree({ autoOpen: false, data: exampleData });

      const onOpen = listenToEvent("tree.open");

      const node1 = tree.getNodeByNameMustExist("node1");
      tree.openNode(node1, false);

      expect(onOpen).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ node: node1 }),
      );
    });

    it("fires tree.close when a node is closed", () => {
      const tree = createHtmlTree({ autoOpen: true, data: exampleData });

      const onClose = listenToEvent("tree.close");

      const node1 = tree.getNodeByNameMustExist("node1");
      tree.closeNode(node1, false);

      expect(onClose).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ node: node1 }),
      );
    });
  });

  describe("tree.refresh", () => {
    it("fires tree.refresh when the tree is refreshed", () => {
      const tree = createHtmlTree({ data: exampleData });

      const onRefresh = listenToEvent("tree.refresh");

      tree.refresh();

      expect(onRefresh).toHaveBeenCalledExactlyOnceWith(null);
    });
  });

  describe("tree.loading_data", () => {
    const server = setupServer(
      http.get("/tree/", () => HttpResponse.json(exampleData)),
    );

    beforeEach(() => {
      server.listen();
    });

    afterAll(() => {
      server.close();
    });

    it("fires tree.loading_data when the data is loading from an url", async () => {
      const onLoading = listenToEvent("tree.loading_data");

      createHtmlTree({ dataUrl: "/tree/" });

      await waitFor(() => {
        expect(onLoading).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            element: htmlElement,
            isLoading: true,
            node: null,
          }),
        );
      });

      await waitFor(() => {
        expect(onLoading).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            element: htmlElement,
            isLoading: false,
            node: null,
          }),
        );
      });
    });
  });

  describe("onLoading", () => {
    const server = setupServer(
      http.get("/tree/", () => HttpResponse.json(exampleData)),
    );

    beforeEach(() => {
      server.listen();
    });

    afterAll(() => {
      server.close();
    });

    it("calls onLoading", async () => {
      const onLoading = vi.fn();

      createHtmlTree({ dataUrl: "/tree/", onLoading });

      await waitFor(() => {
        expect(onLoading).toHaveBeenNthCalledWith(
          1,
          true,
          undefined,
          htmlElement,
        );
      });
      await waitFor(() => {
        expect(onLoading).toHaveBeenNthCalledWith(
          2,
          false,
          undefined,
          htmlElement,
        );
      });
    });
  });
});
