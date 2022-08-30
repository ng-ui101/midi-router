export class NotificationView extends HTMLElement {
    connectedCallback() {
        const layer = document.createElement('div');
        layer.classList.add('layer')
        
        const closeButton = document.createElement('button');
        closeButton.innerText = 'x';
        closeButton.onclick = () => this.close()
        layer.classList.add('close-button')

        const reloadAndCloseButton = document.createElement('button');
        reloadAndCloseButton.innerText = 'Reload MIDI sources';
        reloadAndCloseButton.onclick = () => this.reloadAndClose()
        layer.classList.add('button')

        layer.innerText = 'MIDI controller was not found! Please, reconnect your device and try again!'
        layer.appendChild(reloadAndCloseButton)
        layer.appendChild(closeButton)
        this.append(layer)
    }
}