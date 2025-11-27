import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as Ably from "ably";

interface AblyContextType {
  client: Ably.Realtime | null;
  getChannel: (name: string) => Ably.RealtimeChannel | null;
}

const AblyContext = createContext<AblyContextType>({
  client: null,
  getChannel: () => null,
});

export const AblyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const clientRef = useRef<Ably.Realtime | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (clientRef.current) return;

    const realtime = new Ably.Realtime({
      authUrl: "/api/chat/ably/token-request",
    });

    clientRef.current = realtime;

    const onConnect = () => setReady(true);
    realtime.connection.once("connected", onConnect);

    return () => {
      realtime.connection.off("connected", onConnect);
      realtime.close();
      clientRef.current = null;
    };
  }, []);

  const getChannel = (name: string) => {
    if (!clientRef.current) return null;
    return clientRef.current.channels.get(name);
  };

  return (
    <AblyContext.Provider
      value={{
        client: ready ? clientRef.current : null,
        getChannel,
      }}
    >
      {children}
    </AblyContext.Provider>
  );
};

export const useAbly = () => useContext(AblyContext);
