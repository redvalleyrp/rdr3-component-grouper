const fs = require('fs');

class Component {
    constructor(category, variation) {
        this.category = category;
        this.variation = variation;
    }

    toString() {
        if (this.variation) {
            return `${this.category}_${this.variation}`;
        }

        return this.category;
    }

    static parse(text) {
        const match = text.match(/(?<category>(.+\d+)|(HORSE_EQUIPMENT_HORN_NEW))_(?<variation>.+)/);

        if (match) {
            return new Component(match.groups.category, match.groups.variation);
        }
        
        return new Component(text);
    }
}

class Group {
    constructor(category) {
        this.category = category;
        this.items = []
    }
}

function groupComponentsByCategory(componentKeys) {
    const groupedComponentKeys = []

    let currentGroup = undefined;

    for (const componentKey of componentKeys) {
        if (typeof componentKey === 'string') {
            const component = Component.parse(componentKey);

            if (currentGroup === undefined) {
                currentGroup = new Group(component.category);
            }

            if (currentGroup.category !== component.category) {
                groupedComponentKeys.push(currentGroup.items);
                currentGroup = new Group(component.category);
            }

            currentGroup.items.push(componentKey);
        } else {
            groupedComponentKeys.push(componentKey)
        }
    }

    return groupedComponentKeys;
}

function groupComponentLists(lists) {
    if (Array.isArray(lists)) {
        return groupComponentsByCategory(lists);
    }

    const groupedLists = {}

    for (const [key, value] of Object.entries(lists)) {
        groupedLists[key] = groupComponentLists(value);
    }

    return groupedLists;
}

fs.writeFileSync(
    './grouped_components.json',
    JSON.stringify(groupComponentLists(require('./components.json')), undefined, 4)
);