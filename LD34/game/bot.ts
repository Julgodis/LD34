
class Bot extends GameObject {
    moveDirection: number = 1;
    moving: number = 0;
    speed: number = 0.5;

    hp: number;
    maxHp: number;

    constructor(position: vec2, size: vec2) {
        super(position, size);

        this.maxHp = 100;
        this.hp = this.maxHp;
    }

    update(delta: number) {

    }
}