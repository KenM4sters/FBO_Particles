import Experience from "../Experience";

export default class EventListener {
    constructor() {
        this.experience = new Experience()
        this.listenToScroll()
        this.listenToMouseMove()
    }

    listenToScroll() {
        window.addEventListener('scroll', (event) => {
            this.scrollY = window.scrollY
        })
    }

    listenToMouseMove() {
        window.addEventListener('mousemove', (event) => {
            this.cursorPosX = event.clientX
            this.cursorPosY = event.clientY
        })
    }


}