export class timer {
    constructor(id) {
        this.id = id;
        this.time = 0;
        this.sub = false;
        this.countUp = false; //false is down true is up;
        this.inr = null; //the counting innerval
        this.isCounting = false;
        this.name = 1;
        this.color = "black"
    }

    count() {
        if(!this.isCounting){
            this.isCounting = true;
            if (this.inr != null) {
                clearInterval(this.inr);
                this.inr = null
            }
            if(this.countUp) {
                this.color = "green";
                this.inr = setInterval(() => {
                    this.time++;
                }, 1000);
            } else { //counting down
                this.color = "red";
                this.inr = setInterval(() => {
                    if(this.time > 0) this.time--;
                    if(this.time == 0) {
                        this.isCounting = false;
                        this.color = "black";
                        clearInterval(this.inr);
                        this.inr = null;
                    }
                }, 1000);
            }
        }
    }

    pause() {
        if(this.inr != null) {
            clearInterval(this.inr);
            this.inr = null;
            this.color = "orange";
        }
        this.isCounting = false;
    }

    remove() {
        this.time = 0;
    }    

    timeManip(amt, sub) {
        if(sub) { this.time -= amt; }
        else { this.time += amt; }
        if(this.time < 0) { this.time = 0; }
    }
}
