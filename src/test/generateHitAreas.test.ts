import { generateHitAreasForGroup } from "../dragAndDropHandler/generateHitAreas";
import { HitArea } from "../dragAndDropHandler/types";

describe("generateHitAreasForGroup", () => {
    it("handles zero hit positions", () => {
        const hitAreas: HitArea[] = [];
        generateHitAreasForGroup(hitAreas, [], 0, 0);
        expect(hitAreas).toBeEmpty();
    });
});
