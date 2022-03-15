const path = require('path');
const fs = require('fs');
const lua = require('lua-json');
const sortArray = require('sort-array');

const Group = require('./Group');

const clothes = readClothes(path.resolve(__dirname, 'data', 'cloth_hash_names.lua'));
const sortedClothes = sortClothes(clothes);

const groups = [];

let currentGroup = undefined;

for (const cloth of sortedClothes) {
    if (currentGroup === undefined || !currentGroup.add(cloth)) {
        if (currentGroup?.clothes?.length) {
            groups.push(currentGroup);
        }

        currentGroup = new Group(cloth);
        currentGroup.add(cloth);
    }
}

saveGroupedClothes('./output', groups);

function readClothes(filePath) {
    const input = fs.readFileSync(filePath, 'utf8')
        .replace('cloth_hash_names =', 'return');

    return lua.parse(input);
}

function saveGroupedClothes(directoryPath, groups) {
    const output = {};

    for (const group of groups) {
        output[group.pedType] = output[group.pedType] || {};
        output[group.pedType][group.category] = output[group.pedType][group.category] || [];

        output[group.pedType][group.category].push(group.clothes.map(cloth => cloth.hashname || cloth.hash));
    }

    for (const [pedType, categories] of Object.entries(output)) {
        const luaOutput = lua.format(categories, { spaces: 4 })
            .replace('return', `gComponents.${['male', 'female'].includes(pedType) ? `mp_${pedType}` : pedType} =`);

        fs.writeFileSync(path.resolve(directoryPath, `${pedType}.lua`), luaOutput);
    }
}

function sortClothes(clothes) {
    return sortArray([...clothes], {
        by: ['category', 'hashname', 'ped_type'],
        order: 'asc',
        computed: {
            category: cloth => cloth.category_hashname || cloth.category_hash
        }
    });
}