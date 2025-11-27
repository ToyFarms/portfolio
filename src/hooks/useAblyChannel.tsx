import { useCallback, useEffect, useRef, useState } from "react";
import type * as Ably from "ably";
import { useAbly } from "@/hooks/useAbly";

type AnyMsg = any;

interface UseAblyChannelOpts<T = AnyMsg> {
  channelName: string;
  event: string;
  onMessage: (msg: T) => any;
  autoAttach?: boolean;
}

export function useAblyChannel<T = AnyMsg>(opts: UseAblyChannelOpts<T>) {
  const { getChannel } = useAbly();
  const channelName = opts.channelName;
  const event = opts.event;
  const autoAttach = opts?.autoAttach ?? true;

  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const handlersRef = useRef(new Map<number, (msg: any) => void>());
  const handlerId = useRef(0);

  const [isAttached, setIsAttached] = useState(false);

  const defaultHandler = useCallback(
    (msg: any) => opts.onMessage(msg.data as T),
    [opts.onMessage],
  );

  const internalSubscribe = useCallback((cb: (msg: any) => void) => {
    const id = ++handlerId.current;
    handlersRef.current.set(id, cb);
    return id;
  }, []);

  const internalUnsubscribe = useCallback((id: number) => {
    handlersRef.current.delete(id);
  }, []);

  const publish = useCallback(
    (payload: any, publishEvent?: string) => {
      const ch = channelRef.current;
      if (!ch) {
        console.warn(
          "[useAblyChannel] publish: channel not ready",
          channelName,
        );
        return;
      }
      ch.publish(publishEvent ?? event, payload).catch((err) => {
        if (err) console.error("Ably publish error:", err);
      });
    },
    [channelName, event],
  );

  const send = useCallback(
    (
      payload: (T & { _tempId?: string | number }) | any,
      opts?: { optimistic?: boolean },
    ) => {
      publish(payload, event);
    },
    [publish, event],
  );

  const presence = useCallback(async () => {
    const ch = channelRef.current;
    if (!ch) return null;
    try {
      const members = await ch.presence.get();
      return members;
    } catch (e) {
      console.error("presence.get() failed", e);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!channelName) return;
    const ch = getChannel(channelName);
    if (!ch) return;

    channelRef.current = ch;

    if (autoAttach && ch.state !== "attached") {
      try {
        ch.attach();
      } catch {}
    }

    const onAttach = () => setIsAttached(true);
    const onDetach = () => setIsAttached(false);
    ch.on && ch.on("attached", onAttach);
    ch.on && ch.on("detached", onDetach);

    ch.subscribe(event, defaultHandler);

    const dispatcher = (msg: any) => {
      handlersRef.current.forEach((h) => {
        try {
          h(msg);
        } catch (err) {
          console.error("handler error", err);
        }
      });
    };
    ch.subscribe(event, dispatcher);

    setIsAttached(ch.state === "attached");

    return () => {
      try {
        ch.unsubscribe(event, defaultHandler);
        ch.unsubscribe(event, dispatcher);
        ch.off && ch.off("attached", onAttach);
        ch.off && ch.off("detached", onDetach);
      } catch (e) {}
      if (channelRef.current === ch) channelRef.current = null;
    };
  }, [channelName, getChannel, event, autoAttach]);

  const subscribe = useCallback(
    (cb: (msg: any) => void) => {
      const id = internalSubscribe(cb);
      return id;
    },
    [internalSubscribe],
  );

  const unsubscribe = useCallback(
    (id: number) => {
      internalUnsubscribe(id);
    },
    [internalUnsubscribe],
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return {
    channel: channelRef.current,
    isAttached,
    publish,
    send,
    subscribe,
    unsubscribe,
    presence,
    clearMessages,
  } as const;
}
