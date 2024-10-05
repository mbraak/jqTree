export enum Position {
    Before = 1,
    After,
    Inside,
    None,
}

const positionNames: Record<string, Position> = {
    after: Position.After,
    before: Position.Before,
    inside: Position.Inside,
    none: Position.None,
};

export const getPositionName = (position: Position): string => {
    for (const name in positionNames) {
        if (Object.prototype.hasOwnProperty.call(positionNames, name)) {
            if (positionNames[name] === position) {
                return name;
            }
        }
    }

    return "";
};

export const getPosition = (name: string): Position | undefined =>
    positionNames[name];
