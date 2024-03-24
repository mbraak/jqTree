import { generateHitAreasForGroup } from "../dragAndDropHandler/generateHitAreas";
import { HitArea } from "../dragAndDropHandler/types";
import { Node } from "../node";
import { Position } from "../position";

describe("generateHitAreasForGroup", () => {
    it("doesn't add a hit area with zero hit positions", () => {
        const hitAreas: HitArea[] = [];
        generateHitAreasForGroup(hitAreas, [], 0, 0);
        expect(hitAreas).toBeEmpty();
    });

    it("adds a hit area with one hit position", () => {
        const node = new Node(null);
        const hitPosition = {
            top: 0,
            node,
            position: Position.Inside,
        };

        const hitAreas: HitArea[] = [];
        generateHitAreasForGroup(hitAreas, [hitPosition], 40, 100);

        expect(hitAreas).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    bottom: 100,
                    position: Position.Inside,
                    node,
                    top: 40,
                }),
            ]),
        );
    });

    it("doesn't add a hit area when the position is Position.None", () => {
        const node = new Node(null);
        const hitPosition = {
            top: 0,
            node,
            position: Position.None,
        };

        const hitAreas: HitArea[] = [];
        generateHitAreasForGroup(hitAreas, [hitPosition], 0, 100);
        expect(hitAreas).toBeEmpty();
    });

    it("adds two hit areas with two hit positions", () => {
        const node = new Node(null);
        const hitPositions = [
            {
                top: 0,
                node,
                position: Position.Before,
            },
            {
                top: 0,
                node,
                position: Position.Inside,
            },
        ];

        const hitAreas: HitArea[] = [];
        generateHitAreasForGroup(hitAreas, hitPositions, 40, 100);

        expect(hitAreas).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    bottom: 70,
                    position: Position.Before,
                    node,
                    top: 40,
                }),
                expect.objectContaining({
                    bottom: 100,
                    position: Position.Inside,
                    node,
                    top: 70,
                }),
            ]),
        );
    });
});
