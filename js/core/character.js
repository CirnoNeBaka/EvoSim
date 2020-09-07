
class Stats {
    constructor() {
        // offensive attributes
        this.strength = 0
        this.finesse = 0
        this.intelligence = 0

        // defensive attributes
        this.constitution = 0
        this.agility = 0
        this.willpower = 0
    }
}

class Character {
    constructor(name) {
        this.name = name || "Unknown character"
        this.hp = 100
        this.alive = true
        this.stats = new Stats()
        
        this.inventory = []
        this.weapon = null

        this.location = null
    }

    getAttackDamage() {
        return this.weapon ? this.getWeaponDamage(this.weapon) : this.getUnarmedDamage()
    }

    getUnarmedDamage() {
        const BASE_UNARMED_DAMAGE = 1
        return BASE_UNARMED_DAMAGE + this.stats.strength / 2
    }

    getWeaponDamage(weapon) {
        return weapon.damage 
    }
}

export {
    Character
}