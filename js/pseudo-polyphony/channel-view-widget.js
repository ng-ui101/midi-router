export class ChannelViewWidget extends HTMLElement {
    static get observedAttributes() {
        return ['busy'];
    }

    connectedCallback() {
        this._render();
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        this.classList.toggle('router-widget--note-off');
    }

    _render() {
        const indicator = document.createElement('div');
        indicator.classList.add('router-widget__midi-indicator');
        this.append(indicator);

        const label = document.createElement('label');
        label.innerText = 'MIDI TO';
        label.setAttribute('for', `select-${this.id}`);
        this.append(label);

        const selector = document.createElement('select');
        selector.classList.add('select');
        label.setAttribute('id', `select-${this.id}`);
        
        this.append(selector);

        for (let i = 1; i <= 16; i++) {
            const option = document.createElement('option');
            option.innerText = String(i);
            option.value = String(i);
            selector.appendChild(option);
        }

        selector.selected = String(this.channel);

        selector.onchange = () => this.onChannelChange(+selector.value);

        const closeButton = document.createElement('button');
        closeButton.classList.add('button', 'router-widget__close-button');
        closeButton.onclick = () => this.close();

        const icon = document.createElement('i');
        icon.classList.add('icon-cross');

        this.append(closeButton);
        closeButton.append(icon);
    }
}