export class NotificationView extends HTMLElement {
    connectedCallback() {
        const layer = document.createElement('div');
        layer.classList.add('notification-layer');

        const closeButton = document.createElement('button');
        closeButton.classList.add('button', 'notification-layer__close-button');

        const icon = document.createElement('i');
        icon.classList.add('icon-cross');

        closeButton.onclick = () => this.close();

        const reloadAndCloseButton = document.createElement('button');
        reloadAndCloseButton.innerText = 'Reload MIDI & try again';
        reloadAndCloseButton.onclick = () => this.reloadAndClose();
        reloadAndCloseButton.classList.add('button', 'notification-layer__try-again-button');

        const message = document.createElement('div');
        message.innerText = 'MIDI controller / receiver was not found! Please, reconnect your device and try again!';
        message.classList.add('notification-layer__message');


        layer.appendChild(closeButton);
        closeButton.append(icon);
        
        layer.appendChild(message);

        layer.appendChild(reloadAndCloseButton);

        this.append(layer);
    }
}