import Mob from "./Mob";

class Entity extends Mob {
    constructor(x: number, y: number, config: any) {
        config.displayName = "Druid";
        super(x, y, config);
    }
}

Entity.prototype.animationSetName = "druid";

export default Entity;