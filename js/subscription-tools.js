const subscribers = {};

export function subscribeTo(name, callback)
{
    if (!subscribers[name]) {
        subscribers[name] = [];
    }

    subscribers[name].push(callback);
}

export function unsubscribeFrom(name)
{
    if (subscribers[name]) {
        delete subscribers[name];
    }
}

export function emit(name, data) {
    if (subscribers[name]) {
        for (let callback of subscribers[name]) {
            callback(data);
        }
    }
}