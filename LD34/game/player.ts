
class Player extends GameObject {

    moveDirection: number = 1;
    moving: number = 0;
    speed: number = 0.5;

    hp: number;
    maxHp: number;

    jump_punch: boolean = false;

    constructor(position: vec2, size: vec2) {
        super(position, size);

        this.maxHp = 100;
        this.hp = this.maxHp;
    }


}