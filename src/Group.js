const ClothingNames = require('./ClothingNames');

module.exports = class Group {

    constructor(cloth) {

        this.category = ClothingNames[cloth.category_hashname || cloth.category_hash];

        if (!this.category) {
            return console.log(`\x1b[41mNão foi encontrado o nome da categoria ${cloth.category_hashname || cloth.category_hash}\x1b[0m`)
        }

        this.pedType = cloth.ped_type;

        if (cloth.hashname) {
            this.type = parseClothHashName(cloth.hashname).type;
        }

        this.clothes = [];
    }

    add(cloth) {

        if (!this.belongs(cloth)) {
            return false;
        }

        this.clothes.push(cloth);

        return true;
    }

    belongs(cloth) {

        if (this.category !== (ClothingNames[cloth.category_hashname]) || this.pedType !== cloth.ped_type) {
            return false;
        }

        if (cloth.hashname) {
            const { type } = parseClothHashName(cloth.hashname);

            return this.type === type;
        }

        return true;
    }
};

function parseClothHashName(hashName) {
    const match = hashName.match(/(?<type>(.+\d+)|(HORSE_EQUIPMENT_HORN_NEW))_(?<variation>.+)/);

    if (match) {
        return match.groups;
    }

    return { type: hashName };
}