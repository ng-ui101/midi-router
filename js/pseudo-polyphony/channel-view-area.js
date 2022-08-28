import { emit } from '../subscription-tools.js'

export class ChannelViewArea extends HTMLElement {
    channelsState = [];

    constructor() {
        super();

        this.classList.add('view-area')
    }

    render() {
        this.channelsState.forEach((chState) => {
            if (chState.isRendered) {
                return;
            }
            
            let widget = document.createElement('channel-view-widget');
            widget.classList.add('widget')
            
            widget.id = chState.id;
            widget.channel = chState.channel;

            widget.onChannelChange = (ch) => {
                console.log(this.channelsState)

                chState.channel = ch;
                this.updateRouter();
            }

            widget.onRemove = () => this.removeChannel(chState);

            this.append(widget)

            chState.isRendered = true;
        });

        if (!document.querySelector(`#addButton`)) {
            const addButton = document.createElement('button');
            addButton.classList.add('add-button')
            addButton.id = 'addButton'
            addButton.innerText = '+'
            addButton.onclick = () => this.addChannel()
            this.append(addButton)
        }

        console.log(this.channelsState)

        this.updateRouter();
    }

    addChannel() {
        this.channelsState.push({
            id: `channel-id-${(new Date()).getTime()}`,
            isRendered: false,
            channel: 1,
        })

        this.render();
    }

    removeChannel(channel) {
        const view = document.querySelector(`#${channel.id}`)
        this.removeChild(view)
        
        const currentNoteIndex = this.channelsState.findIndex((ch) => ch.id === channel.id);
        this.channelsState.splice(currentNoteIndex, 1);
        
        this.render();
    }

    updateRouter() {
        emit('channels-state-was-changed', this.channelsState);
    }

    connectedCallback() {
        this.render();
    }
}