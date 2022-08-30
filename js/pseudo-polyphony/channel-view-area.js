import { emit, subscribeTo, unsubscribeFrom } from '../subscription-tools.js'
import { SUBSCRIPTION_DICTIONARY } from '../constants.js'

export class ChannelViewArea extends HTMLElement {
    channelsState = [];

    constructor() {
        super();

        this.classList.add('view-area')
        subscribeTo(SUBSCRIPTION_DICTIONARY.NOTE_WAS_PLAYED, (ch) => this._markChannel(ch, 'true'))
        subscribeTo(SUBSCRIPTION_DICTIONARY.NOTE_WAS_RELEASED, (ch) => this._markChannel(ch, 'false'))
    }

    connectedCallback() {
        this._render();
    }

    disconnectedCallback() {
        unsubscribeFrom(SUBSCRIPTION_DICTIONARY.NOTE_WAS_PLAYED);
        unsubscribeFrom(SUBSCRIPTION_DICTIONARY.NOTE_WAS_RELEASED);
    }

    _render() {
        this.channelsState.forEach((chState) => {
            if (chState.isRendered) {
                return;
            }
                        
            let widget = document.createElement('channel-view-widget');
            widget.classList.add('widget')
            
            widget.id = chState.id;
            widget.channel = chState.channel;

            widget.onChannelChange = (ch) => {
                chState.channel = ch;
                this._updateRouter();
            }

            widget.onRemove = () => this._removeChannel(chState);

            widget.setAttribute('busy', 'false');

            this.append(widget)

            chState.isRendered = true;
        });

        if (!document.querySelector(`#addButton`)) {
            const addButton = document.createElement('button');
            addButton.classList.add('add-button')
            addButton.id = 'addButton'
            addButton.innerText = '+'
            addButton.onclick = () => this._addChannel()
            this.append(addButton)
        }

        this._updateRouter();
    }

    _markChannel(ch, mark) {
        const id = ch.assignedChannel.id;
        const widget = document.querySelector(`#${id}`);
        widget.setAttribute('busy', mark);
    }

    _addChannel() {
        this.channelsState.push({
            id: `channel-id-${(new Date()).getTime()}`,
            isRendered: false,
            channel: 1,
        })

        this._render();
    }

    _removeChannel(channel) {
        const view = document.querySelector(`#${channel.id}`)
        this.removeChild(view)
        
        const currentNoteIndex = this.channelsState.findIndex((ch) => ch.id === channel.id);
        this.channelsState.splice(currentNoteIndex, 1);
        
        this._render();
    }

    _updateRouter() {
        emit(SUBSCRIPTION_DICTIONARY.CHANNEL_SETTINGS_WAS_CHANGED, this.channelsState);
    }
}