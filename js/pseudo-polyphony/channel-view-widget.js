export class ChannelViewWidget extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        const indicator = document.createElement('div');
        indicator.classList.add('circle')
        this.append(indicator)

        const label = document.createElement('label');
        label.innerText = 'MIDI TO'
        label.setAttribute('for', `select-${this.id}`)
        this.append(label)

        const selector = document.createElement('select');
        label.setAttribute('id', `select-${this.id}`)
        
        this.append(selector)

        for (let i = 1; i <= 16; i++) {
            const option = document.createElement('option');
            option.innerText = String(i);
            option.value = String(i);
            selector.appendChild(option);
        }

        selector.selected = String(this.channel)

        selector.onchange = () => this.onChannelChange(+selector.value)

        const button = document.createElement('button');
        button.onclick = () => this.onRemove()
        button.innerText = 'x'

        this.append(button)
    }
    
    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['busy'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.classList.toggle('note-on')
    }
}