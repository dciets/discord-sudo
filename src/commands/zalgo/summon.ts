import * as chars from "./chars";

const types = [
    ["up", 4],
    ["middle", 1],
    ["down", 4],
];

export const dontDoIt = (text: string, level: number = 1) => {
    let ntext = "";
    for (let i = 0; i < text.length; ++i) {
        if (chars.pattern.test(text[i])) continue;

        if (text[i].length > 1) {
            ntext += text[i];
            continue;
        }

        ntext += text[i];

        for (let [type, mult] of types)
            for (let j = 0; j < level * (mult as number); ++j)
                ntext += chars.randChar(type as any);
    }
    return ntext;
};
