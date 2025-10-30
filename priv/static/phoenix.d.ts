declare module "constants" {
    export const globalSelf: (Window & typeof globalThis) | null;
    export const phxWindow: (Window & typeof globalThis) | null;
    export const global: typeof globalThis;
    export const DEFAULT_VSN: "2.0.0";
    export namespace SOCKET_STATES {
        let connecting: number;
        let open: number;
        let closing: number;
        let closed: number;
    }
    export const DEFAULT_TIMEOUT: 10000;
    export const WS_CLOSE_NORMAL: 1000;
    export namespace CHANNEL_STATES {
        let closed_1: string;
        export { closed_1 as closed };
        export let errored: string;
        export let joined: string;
        export let joining: string;
        export let leaving: string;
    }
    export namespace CHANNEL_EVENTS {
        let close: string;
        let error: string;
        let join: string;
        let reply: string;
        let leave: string;
    }
    export namespace TRANSPORTS {
        let longpoll: string;
        let websocket: string;
    }
    export namespace XHR_STATES {
        let complete: number;
    }
    export const AUTH_TOKEN_PREFIX: "base64url.bearer.phx.";
}
declare module "ajax" {
    export default class Ajax {
        static request(method: any, endPoint: any, headers: any, body: any, timeout: any, ontimeout: any, callback: any): any;
        static fetchRequest(method: any, endPoint: any, headers: any, body: any, timeout: any, ontimeout: any, callback: any): AbortController | null;
        static xdomainRequest(req: any, method: any, endPoint: any, body: any, timeout: any, ontimeout: any, callback: any): any;
        static xhrRequest(req: any, method: any, endPoint: any, headers: any, body: any, timeout: any, ontimeout: any, callback: any): any;
        static parseJSON(resp: any): any;
        static serialize(obj: any, parentKey: any): any;
        static appendParams(url: any, params: any): any;
    }
}
declare module "utils" {
    export function closure(value: any): any;
}
declare module "push" {
    /**
     * Initializes the Push
     * @param {Channel} channel - The Channel
     * @param {string} event - The event, for example `"phx_join"`
     * @param {Object} payload - The payload, for example `{user_id: 123}`
     * @param {number} timeout - The push timeout in milliseconds
     */
    export default class Push {
        constructor(channel: any, event: any, payload: any, timeout: any);
        channel: any;
        event: any;
        payload: any;
        receivedResp: any;
        timeout: any;
        timeoutTimer: NodeJS.Timeout | null;
        recHooks: any[];
        sent: boolean;
        /**
         *
         * @param {number} timeout
         */
        resend(timeout: number): void;
        /**
         *
         */
        send(): void;
        /**
         *
         * @param {*} status
         * @param {*} callback
         */
        receive(status: any, callback: any): this;
        /**
         * @private
         */
        private reset;
        ref: any;
        refEvent: any;
        /**
         * @private
         */
        private matchReceive;
        /**
         * @private
         */
        private cancelRefEvent;
        /**
         * @private
         */
        private cancelTimeout;
        /**
         * @private
         */
        private startTimeout;
        /**
         * @private
         */
        private hasReceived;
        /**
         * @private
         */
        private trigger;
    }
}
declare module "timer" {
    /**
     *
     * Creates a timer that accepts a `timerCalc` function to perform
     * calculated timeout retries, such as exponential backoff.
     *
     * @example
     * let reconnectTimer = new Timer(() => this.connect(), function(tries){
     *   return [1000, 5000, 10000][tries - 1] || 10000
     * })
     * reconnectTimer.scheduleTimeout() // fires after 1000
     * reconnectTimer.scheduleTimeout() // fires after 5000
     * reconnectTimer.reset()
     * reconnectTimer.scheduleTimeout() // fires after 1000
     *
     * @param {Function} callback
     * @param {Function} timerCalc
     */
    export default class Timer {
        constructor(callback: any, timerCalc: any);
        callback: any;
        timerCalc: any;
        timer: NodeJS.Timeout | null;
        tries: number;
        reset(): void;
        /**
         * Cancels any previous scheduleTimeout and schedules callback
         */
        scheduleTimeout(): void;
    }
}
declare module "channel" {
    /**
     *
     * @param {string} topic
     * @param {(Object|function)} params
     * @param {Socket} socket
     */
    export default class Channel {
        constructor(topic: any, params: any, socket: any);
        state: string;
        topic: any;
        params: any;
        socket: any;
        bindings: any[];
        bindingRef: number;
        timeout: any;
        joinedOnce: boolean;
        joinPush: Push;
        pushBuffer: any[];
        stateChangeRefs: any[];
        rejoinTimer: Timer;
        /**
         * Join the channel
         * @param {integer} timeout
         * @returns {Push}
         */
        join(timeout?: integer): Push;
        /**
         * Hook into channel close
         * @param {Function} callback
         */
        onClose(callback: Function): void;
        /**
         * Hook into channel errors
         * @param {Function} callback
         */
        onError(callback: Function): integer;
        /**
         * Subscribes on channel events
         *
         * Subscription returns a ref counter, which can be used later to
         * unsubscribe the exact event listener
         *
         * @example
         * const ref1 = channel.on("event", do_stuff)
         * const ref2 = channel.on("event", do_other_stuff)
         * channel.off("event", ref1)
         * // Since unsubscription, do_stuff won't fire,
         * // while do_other_stuff will keep firing on the "event"
         *
         * @param {string} event
         * @param {Function} callback
         * @returns {integer} ref
         */
        on(event: string, callback: Function): integer;
        /**
         * Unsubscribes off of channel events
         *
         * Use the ref returned from a channel.on() to unsubscribe one
         * handler, or pass nothing for the ref to unsubscribe all
         * handlers for the given event.
         *
         * @example
         * // Unsubscribe the do_stuff handler
         * const ref1 = channel.on("event", do_stuff)
         * channel.off("event", ref1)
         *
         * // Unsubscribe all handlers from event
         * channel.off("event")
         *
         * @param {string} event
         * @param {integer} ref
         */
        off(event: string, ref: integer): void;
        /**
         * @private
         */
        private canPush;
        /**
         * Sends a message `event` to phoenix with the payload `payload`.
         * Phoenix receives this in the `handle_in(event, payload, socket)`
         * function. if phoenix replies or it times out (default 10000ms),
         * then optionally the reply can be received.
         *
         * @example
         * channel.push("event")
         *   .receive("ok", payload => console.log("phoenix replied:", payload))
         *   .receive("error", err => console.log("phoenix errored", err))
         *   .receive("timeout", () => console.log("timed out pushing"))
         * @param {string} event
         * @param {Object} payload
         * @param {number} [timeout]
         * @returns {Push}
         */
        push(event: string, payload: Object, timeout?: number): Push;
        /** Leaves the channel
         *
         * Unsubscribes from server events, and
         * instructs channel to terminate on server
         *
         * Triggers onClose() hooks
         *
         * To receive leave acknowledgements, use the `receive`
         * hook to bind to the server ack, ie:
         *
         * @example
         * channel.leave().receive("ok", () => alert("left!") )
         *
         * @param {integer} timeout
         * @returns {Push}
         */
        leave(timeout?: integer): Push;
        /**
         * Overridable message hook
         *
         * Receives all events for specialized message handling
         * before dispatching to the channel callbacks.
         *
         * Must return the payload, modified or unmodified
         * @param {string} event
         * @param {Object} payload
         * @param {integer} ref
         * @returns {Object}
         */
        onMessage(_event: any, payload: Object, _ref: any): Object;
        /**
         * @private
         */
        private isMember;
        /**
         * @private
         */
        private joinRef;
        /**
         * @private
         */
        private rejoin;
        /**
         * @private
         */
        private trigger;
        /**
         * @private
         */
        private replyEventName;
        /**
         * @private
         */
        private isClosed;
        /**
         * @private
         */
        private isErrored;
        /**
         * @private
         */
        private isJoined;
        /**
         * @private
         */
        private isJoining;
        /**
         * @private
         */
        private isLeaving;
    }
    import Push from "push";
    import Timer from "timer";
}
declare module "longpoll" {
    export default class LongPoll {
        constructor(endPoint: any, protocols: any);
        authToken: string | undefined;
        endPoint: any;
        token: any;
        skipHeartbeat: boolean;
        reqs: Set<any>;
        awaitingBatchAck: boolean;
        currentBatch: any[] | null;
        currentBatchTimer: NodeJS.Timeout | null;
        batchBuffer: any[];
        onopen: () => void;
        onerror: () => void;
        onmessage: () => void;
        onclose: () => void;
        pollEndpoint: any;
        readyState: number;
        normalizeEndpoint(endPoint: any): any;
        endpointURL(): any;
        closeAndRetry(code: any, reason: any, wasClean: any): void;
        ontimeout(): void;
        isActive(): boolean;
        poll(): void;
        send(body: any): void;
        batchSend(messages: any): void;
        close(code: any, reason: any, wasClean: any): void;
        ajax(method: any, headers: any, body: any, onCallerTimeout: any, callback: any): void;
    }
}
declare module "presence" {
    /**
     * Initializes the Presence
     * @param {Channel} channel - The Channel
     * @param {Object} opts - The options,
     *        for example `{events: {state: "state", diff: "diff"}}`
     */
    export default class Presence {
        /**
         * Used to sync the list of presences on the server
         * with the client's state. An optional `onJoin` and `onLeave` callback can
         * be provided to react to changes in the client's local presences across
         * disconnects and reconnects with the server.
         *
         * @returns {Presence}
         */
        static syncState(currentState: any, newState: any, onJoin: any, onLeave: any): Presence;
        /**
         *
         * Used to sync a diff of presence join and leave
         * events from the server, as they happen. Like `syncState`, `syncDiff`
         * accepts optional `onJoin` and `onLeave` callbacks to react to a user
         * joining or leaving from a device.
         *
         * @returns {Presence}
         */
        static syncDiff(state: any, diff: any, onJoin: any, onLeave: any): Presence;
        /**
         * Returns the array of presences, with selected metadata.
         *
         * @param {Object} presences
         * @param {Function} chooser
         *
         * @returns {Presence}
         */
        static list(presences: Object, chooser: Function): Presence;
        static map(obj: any, func: any): any[];
        static clone(obj: any): any;
        constructor(channel: any, opts?: {});
        state: {};
        pendingDiffs: any[];
        channel: any;
        joinRef: any;
        caller: {
            onJoin: () => void;
            onLeave: () => void;
            onSync: () => void;
        };
        onJoin(callback: any): void;
        onLeave(callback: any): void;
        onSync(callback: any): void;
        list(by: any): Presence;
        inPendingSyncState(): boolean;
    }
}
declare module "serializer" {
    namespace _default {
        let HEADER_LENGTH: number;
        let META_LENGTH: number;
        namespace KINDS {
            let push: number;
            let reply: number;
            let broadcast: number;
        }
        function encode(msg: any, callback: any): any;
        function decode(rawPayload: any, callback: any): any;
        function binaryEncode(message: any): any;
        function binaryDecode(buffer: any): {
            join_ref: any;
            ref: null;
            topic: any;
            event: any;
            payload: any;
        } | {
            join_ref: any;
            ref: any;
            topic: any;
            event: string;
            payload: {
                status: any;
                response: any;
            };
        } | undefined;
        function decodePush(buffer: any, view: any, decoder: any): {
            join_ref: any;
            ref: null;
            topic: any;
            event: any;
            payload: any;
        };
        function decodeReply(buffer: any, view: any, decoder: any): {
            join_ref: any;
            ref: any;
            topic: any;
            event: string;
            payload: {
                status: any;
                response: any;
            };
        };
        function decodeBroadcast(buffer: any, view: any, decoder: any): {
            join_ref: null;
            ref: null;
            topic: any;
            event: any;
            payload: any;
        };
    }
    export default _default;
}
declare module "socket" {
    /** Initializes the Socket *
     *
     * For IE8 support use an ES5-shim (https://github.com/es-shims/es5-shim)
     *
     * @param {string} endPoint - The string WebSocket endpoint, ie, `"ws://example.com/socket"`,
     *                                               `"wss://example.com"`
     *                                               `"/socket"` (inherited host & protocol)
     * @param {Object} [opts] - Optional configuration
     * @param {Function} [opts.transport] - The Websocket Transport, for example WebSocket or Phoenix.LongPoll.
     *
     * Defaults to WebSocket with automatic LongPoll fallback if WebSocket is not defined.
     * To fallback to LongPoll when WebSocket attempts fail, use `longPollFallbackMs: 2500`.
     *
     * @param {number} [opts.longPollFallbackMs] - The millisecond time to attempt the primary transport
     * before falling back to the LongPoll transport. Disabled by default.
     *
     * @param {boolean} [opts.debug] - When true, enables debug logging. Default false.
     *
     * @param {Function} [opts.encode] - The function to encode outgoing messages.
     *
     * Defaults to JSON encoder.
     *
     * @param {Function} [opts.decode] - The function to decode incoming messages.
     *
     * Defaults to JSON:
     *
     * ```javascript
     * (payload, callback) => callback(JSON.parse(payload))
     * ```
     *
     * @param {number} [opts.timeout] - The default timeout in milliseconds to trigger push timeouts.
     *
     * Defaults `DEFAULT_TIMEOUT`
     * @param {number} [opts.heartbeatIntervalMs] - The millisec interval to send a heartbeat message
     * @param {Function} [opts.reconnectAfterMs] - The optional function that returns the
     * socket reconnect interval, in milliseconds.
     *
     * Defaults to stepped backoff of:
     *
     * ```javascript
     * function(tries){
     *   return [10, 50, 100, 150, 200, 250, 500, 1000, 2000][tries - 1] || 5000
     * }
     * ````
     *
     * @param {Function} [opts.rejoinAfterMs] - The optional function that returns the millisec
     * rejoin interval for individual channels.
     *
     * ```javascript
     * function(tries){
     *   return [1000, 2000, 5000][tries - 1] || 10000
     * }
     * ````
     *
     * @param {Function} [opts.logger] - The optional function for specialized logging, ie:
     *
     * ```javascript
     * function(kind, msg, data) {
     *   console.log(`${kind}: ${msg}`, data)
     * }
     * ```
     *
     * @param {number} [opts.longpollerTimeout] - The maximum timeout of a long poll AJAX request.
     *
     * Defaults to 20s (double the server long poll timer).
     *
     * @param {(Object|function)} [opts.params] - The optional params to pass when connecting
     * @param {string} [opts.authToken] - the optional authentication token to be exposed on the server
     * under the `:auth_token` connect_info key.
     * @param {string} [opts.binaryType] - The binary type to use for binary WebSocket frames.
     *
     * Defaults to "arraybuffer"
     *
     * @param {vsn} [opts.vsn] - The serializer's protocol version to send on connect.
     *
     * Defaults to DEFAULT_VSN.
     *
     * @param {Object} [opts.sessionStorage] - An optional Storage compatible object
     * Phoenix uses sessionStorage for longpoll fallback history. Overriding the store is
     * useful when Phoenix won't have access to `sessionStorage`. For example, This could
     * happen if a site loads a cross-domain channel in an iframe. Example usage:
     *
     *     class InMemoryStorage {
     *       constructor() { this.storage = {} }
     *       getItem(keyName) { return this.storage[keyName] || null }
     *       removeItem(keyName) { delete this.storage[keyName] }
     *       setItem(keyName, keyValue) { this.storage[keyName] = keyValue }
     *     }
     *
    */
    export default class Socket {
        constructor(endPoint: any, opts?: {});
        stateChangeCallbacks: {
            open: never[];
            close: never[];
            error: never[];
            message: never[];
        };
        channels: any[];
        sendBuffer: any[];
        ref: number;
        timeout: any;
        transport: any;
        primaryPassedHealthCheck: boolean;
        longPollFallbackMs: any;
        fallbackTimer: NodeJS.Timeout | null;
        sessionStore: any;
        establishedConnections: number;
        defaultEncoder: (msg: any, callback: any) => any;
        defaultDecoder: (rawPayload: any, callback: any) => any;
        closeWasClean: boolean;
        disconnecting: boolean;
        binaryType: any;
        connectClock: number;
        encode: any;
        decode: any;
        heartbeatIntervalMs: any;
        rejoinAfterMs: (tries: any) => any;
        reconnectAfterMs: (tries: any) => any;
        logger: any;
        longpollerTimeout: any;
        params: any;
        endPoint: string;
        vsn: any;
        heartbeatTimeoutTimer: NodeJS.Timeout | null;
        heartbeatTimer: NodeJS.Timeout | null;
        pendingHeartbeatRef: string | null;
        reconnectTimer: Timer;
        authToken: any;
        /**
         * Returns the LongPoll transport reference
         */
        getLongPollTransport(): typeof LongPoll;
        /**
         * Disconnects and replaces the active transport
         *
         * @param {Function} newTransport - The new transport class to instantiate
         *
         */
        replaceTransport(newTransport: Function): void;
        conn: any;
        /**
         * Returns the socket protocol
         *
         * @returns {string}
         */
        protocol(): string;
        /**
         * The fully qualified socket url
         *
         * @returns {string}
         */
        endPointURL(): string;
        /**
         * Disconnects the socket
         *
         * See https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes for valid status codes.
         *
         * @param {Function} callback - Optional callback which is called after socket is disconnected.
         * @param {integer} code - A status code for disconnection (Optional).
         * @param {string} reason - A textual description of the reason to disconnect. (Optional)
         */
        disconnect(callback: Function, code: integer, reason: string): void;
        /**
         *
         * @param {Object} params - The params to send when connecting, for example `{user_id: userToken}`
         *
         * Passing params to connect is deprecated; pass them in the Socket constructor instead:
         * `new Socket("/socket", {params: {user_id: userToken}})`.
         */
        connect(params: Object): void;
        /**
         * Logs the message. Override `this.logger` for specialized logging. noops by default
         * @param {string} kind
         * @param {string} msg
         * @param {Object} data
         */
        log(kind: string, msg: string, data: Object): void;
        /**
         * Returns true if a logger has been set on this socket.
         */
        hasLogger(): boolean;
        /**
         * Registers callbacks for connection open events
         *
         * @example socket.onOpen(function(){ console.info("the socket was opened") })
         *
         * @param {Function} callback
         */
        onOpen(callback: Function): string;
        /**
         * Registers callbacks for connection close events
         * @param {Function} callback
         */
        onClose(callback: Function): string;
        /**
         * Registers callbacks for connection error events
         *
         * @example socket.onError(function(error){ alert("An error occurred") })
         *
         * @param {Function} callback
         */
        onError(callback: Function): string;
        /**
         * Registers callbacks for connection message events
         * @param {Function} callback
         */
        onMessage(callback: Function): string;
        /**
         * Pings the server and invokes the callback with the RTT in milliseconds
         * @param {Function} callback
         *
         * Returns true if the ping was pushed or false if unable to be pushed.
         */
        ping(callback: Function): boolean;
        /**
         * @private
         */
        private transportConnect;
        getSession(key: any): any;
        storeSession(key: any, val: any): void;
        connectWithFallback(fallbackTransport: any, fallbackThreshold?: number): void;
        clearHeartbeats(): void;
        onConnOpen(): void;
        /**
         * @private
         */
        private heartbeatTimeout;
        resetHeartbeat(): void;
        teardown(callback: any, code: any, reason: any): any;
        waitForBufferDone(callback: any, tries?: number): void;
        waitForSocketClosed(callback: any, tries?: number): void;
        onConnClose(event: any): void;
        /**
         * @private
         */
        private onConnError;
        /**
         * @private
         */
        private triggerChanError;
        /**
         * @returns {string}
         */
        connectionState(): string;
        /**
         * @returns {boolean}
         */
        isConnected(): boolean;
        /**
         * @private
         *
         * @param {Channel}
         */
        private remove;
        /**
         * Removes `onOpen`, `onClose`, `onError,` and `onMessage` registrations.
         *
         * @param {refs} - list of refs returned by calls to
         *                 `onOpen`, `onClose`, `onError,` and `onMessage`
         */
        off(refs: any): void;
        /**
         * Initiates a new channel for the given topic
         *
         * @param {string} topic
         * @param {Object} chanParams - Parameters for the channel
         * @returns {Channel}
         */
        channel(topic: string, chanParams?: Object): Channel;
        /**
         * @param {Object} data
         */
        push(data: Object): void;
        /**
         * Return the next message ref, accounting for overflows
         * @returns {string}
         */
        makeRef(): string;
        sendHeartbeat(): void;
        flushSendBuffer(): void;
        onConnMessage(rawMessage: any): void;
        leaveOpenTopic(topic: any): void;
    }
    import Timer from "timer";
    import LongPoll from "longpoll";
    import Channel from "channel";
}
declare module "index" {
    import Channel from "channel";
    import LongPoll from "longpoll";
    import Presence from "presence";
    import Serializer from "serializer";
    import Socket from "socket";
    export { Channel, LongPoll, Presence, Serializer, Socket };
}
//# sourceMappingURL=phoenix.d.ts.map