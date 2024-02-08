import Experience from '../Experience.js'
// import Environment from './Environment.js'
import Page from './Page.js'



export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        
        this.resources.on('ready', () => {
            console.log('resources are ready')
            this.page = new Page()
            // Setup
            // this.environment = new Environment()
        })

    }

    update() {
        this.page.update()
    }

}