"use client";

import { IUser } from "@/model/User";
import {
  ArrowLeft,
  Dot,
  Ellipsis,
  MessageCircleIcon,
  Plus,
  RefreshCwIcon,
  Send,
  X,
} from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";
import useSWR from "swr";
import { IChatMessage, IChatRoom, IChatRoomPopulated } from "@/model/Chat";
import { SessionProvider, useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { formatVariablePrecisionDate } from "@/lib/utils";
import ProfileImage from "./profile-image";
import * as Ably from "ably";
import {
  AblyProvider,
  ChannelProvider,
  useChannel,
  usePresence,
  usePresenceListener,
} from "ably/react";

type Page = { name: string; params?: Record<string, any> };

interface LocalHistoryContextValue {
  stack: Page[];
  current: Page;
  push: (p: Page, opts?: { pushBrowserState?: boolean }) => void;
  pop: (opts?: { replaceBrowserState?: boolean }) => void;
  replace: (p: Page) => void;
  reset: (pages?: Page[]) => void;
  canGoBack: () => boolean;
}

const LocalHistoryContext = createContext<LocalHistoryContextValue | null>(
  null,
);

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export const LocalHistoryProvider: React.FC<{
  children: React.ReactNode;
  initial?: Page[];
  syncWithBrowser?: boolean;
}> = ({ children, initial = [{ name: "menu" }], syncWithBrowser = true }) => {
  const [stack, setStack] = useState<Page[]>(initial);
  const sessionIdRef = useRef<string>(makeId());

  const push = (
    page: Page,
    opts: { pushBrowserState?: boolean } = { pushBrowserState: true },
  ) => {
    setStack((s) => [...s, page]);
    if (
      syncWithBrowser &&
      typeof window !== "undefined" &&
      opts.pushBrowserState
    ) {
      window.history.pushState(
        { __chat_overlay: true, sessionId: sessionIdRef.current },
        "",
      );
    }
  };

  const pop = (
    opts: { replaceBrowserState?: boolean } = { replaceBrowserState: false },
  ) => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    if (
      syncWithBrowser &&
      typeof window !== "undefined" &&
      opts.replaceBrowserState
    ) {
      window.history.replaceState({}, "");
    }
  };

  const replace = (page: Page) => {
    setStack((s) => [...s.slice(0, -1), page]);
  };

  const reset = (pages: Page[] = initial) => setStack(pages);

  useEffect(() => {
    if (!syncWithBrowser || typeof window === "undefined") return;

    const onPop = (e: PopStateEvent) => {
      const st = (e?.state ?? null) as any;
      if (st && st.__chat_overlay && st.sessionId === sessionIdRef.current) {
        setStack((s) => (s.length > 1 ? s.slice(0, -1) : initial));
      }
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [syncWithBrowser]);

  const value = useMemo(
    () => ({
      stack,
      current: stack[stack.length - 1],
      push,
      pop,
      replace,
      reset,
      canGoBack: () => stack.length > 1,
    }),
    [stack],
  );

  return (
    <LocalHistoryContext.Provider value={value}>
      {children}
    </LocalHistoryContext.Provider>
  );
};

export function useLocalHistory() {
  const ctx = useContext(LocalHistoryContext);
  if (!ctx)
    throw new Error("useLocalHistory must be used inside LocalHistoryProvider");
  return ctx;
}

function RoomRow({
  room,
  currentUserName,
  onOpen,
}: {
  room: IChatRoomPopulated;
  currentUserName?: string | null;
  onOpen: (room: IChatRoomPopulated) => void;
}) {
  const initialLast =
    room.messages.length > 0 ? room.messages[room.messages.length - 1] : null;

  const [lastMessage, setLastMessage] = useState<IChatMessage | null>(
    initialLast,
  );

  useChannel((room._id as any).toString(), (msg) => {
    setLastMessage(msg.data);
  });

  const otherParticipants = room.participants.filter(
    (p) => p.name !== currentUserName,
  );

  return (
    <button
      className="px-3 py-2 border flex items-center gap-2 hover:bg-gray-200"
      onClick={() => onOpen(room)}
      key={(room._id as any).toString()}
    >
      {otherParticipants.map((u: IUser) => (
        <div
          key={(u._id as any).toString()}
          className="flex gap-2 items-center overflow-x-hidden grow-1"
        >
          <ProfileImage user={u} />
          <div className="flex flex-col text-left grow-1">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <span>{u.name}</span>
                <Dot
                  width={16}
                  height={16}
                  fill={true ? "text-green-500" : "text-gray-400"}
                ></Dot>
              </div>
              {lastMessage && lastMessage.createdAt && (
                <span className="text-sm text-gray-500">
                  {formatVariablePrecisionDate(new Date(lastMessage.createdAt))}
                </span>
              )}
            </div>

            {lastMessage && (
              <span className="text-sm text-gray-500 whitespace-nowrap text-ellipsis">
                <span>{room.participants[lastMessage.sender].name}: </span>
                <span className="truncate inline-block max-w-[200px] align-bottom">
                  {lastMessage.content}
                </span>
              </span>
            )}
          </div>
        </div>
      ))}
    </button>
  );
}

function ChatList() {
  const [rooms, setRooms] = React.useState<IChatRoomPopulated[]>([]);
  const { error, isLoading } = useSWR(
    "/api/chat",
    (url: string) =>
      fetch(url)
        .then((res) => res.json())
        .then((json) => {
          if (json.error) throw json.error;
          setRooms(json.rooms);
        }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      dedupingInterval: 2000,
    },
  );
  const { push } = useLocalHistory();
  const { data: session } = useSession();

  function openChat(room: IChatRoomPopulated) {
    push({ name: "chat", params: { id: room._id } });
  }

  if (isLoading) return <p>Fetching users...</p>;
  if (error)
    return (
      <p>
        Error loading users
        <br />
        <span className="text-center text-red-500">{String(error)}</span>
      </p>
    );

  return (
    <div className="flex flex-col gap-2">
      {rooms.map((r) => (
        <ChannelProvider
          channelName={(r._id as any).toString()}
          key={(r._id as any).toString()}
        >
          <RoomRow
            room={r}
            currentUserName={session?.user.name}
            onOpen={openChat}
          />
        </ChannelProvider>
      ))}
    </div>
  );
}

const Menu: React.FC = () => {
  const { push } = useLocalHistory();
  return (
    <div className="space-y-2">
      <h3>Menu</h3>
      <div className="flex flex-col gap-2 text-sm">
        <button
          onClick={() => push({ name: "add" })}
          className="flex justify-center items-center gap-2 px-3 py-2 border"
        >
          <Plus />
          <span>New chat</span>
        </button>
      </div>
      <ChatList />
    </div>
  );
};

function ChatRoom() {
  const { current } = useLocalHistory();
  const inputRef = useRef<HTMLInputElement>(null);
  const [participants, setParticipants] = useState<IUser[]>([]);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const { data: session } = useSession();
  const [recipientUser, setRecipientUser] = useState<IUser>();
  const { pop } = useLocalHistory();
  const { channel } = useChannel(`${current.params?.id}`, (msg) => {
    setMessages((prev) => [...prev, msg.data]);
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function fetchMessage() {
    try {
      const res = await fetch(`/api/chat?id=${current?.params?.id}`);
      const json: { room: IChatRoomPopulated } = await res.json();
      setMessages(json.room?.messages ?? []);
      setParticipants(json.room.participants);
      setRecipientUser(
        json.room.participants.find((u) => u._id !== session?.user.id),
      );
    } catch (err) {
      console.error(err);
    }
  }

  useLayoutEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [messages.length]);

  useEffect(() => {
    if (!current?.params?.id) return;
    fetchMessage();
  }, [current?.params?.id]);

  async function sendMessage() {
    const value = inputRef.current?.value;
    if (!value) return;

    try {
      const res = await fetch("/api/chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatroomId: current?.params?.id,
          content: value,
        }),
      });
      const room = (await res.json()).room as IChatRoom;
      const msg = room.messages[room.messages.length - 1];

      channel.publish("messages", msg);

      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      console.error(err);
    }
  }

  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        chat id: {String(current?.params?.id ?? "—")}
      </div>
      <div className="flex justify-between">
        {recipientUser ? (
          <div className="flex gap-2 items-center">
            <ProfileImage user={recipientUser} />
            <span>{recipientUser.name}</span>
          </div>
        ) : (
          <div></div>
        )}
        <div className="flex gap-4">
          <button onClick={fetchMessage}>
            <RefreshCwIcon size={20} />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button>
                <Ellipsis />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="outline-none text-white"
                      variant="destructive"
                      onClick={() => setOpen(true)}
                    >
                      Delete chat
                    </Button>
                  </AlertDialogTrigger>
                </AlertDialog>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all the chat between you and the recipient
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                asChild
                onClick={() =>
                  recipientUser &&
                  fetch("/api/chat/room", {
                    method: "DELETE",
                    body: JSON.stringify({ userId: recipientUser._id }),
                  }).then(() => pop())
                }
              >
                <button>Continue</button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="min-h-128 max-h-96 overflow-auto rounded-lg border p-3 text-sm flex flex-col gap-3 bg-white shadow-sm">
        {messages.length !== 0 &&
          messages.map((m) => (
            <div
              key={(m._id as any).toString()}
              className={`flex gap-3 ${participants[m.sender]._id !== session?.user.id ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex flex-col max-w-[70%] ${participants[m.sender]._id !== session?.user.id ? "items-end" : "items-start"}`}
              >
                <div
                  className={`text-xs text-gray-500 mb-1 flex gap-4 ${participants[m.sender]._id !== session?.user.id ? "flex-row-reverse" : ""}`}
                >
                  <div>{participants[m.sender].name}</div>
                  {m.createdAt && (
                    <span>
                      {formatVariablePrecisionDate(new Date(m.createdAt))}
                    </span>
                  )}
                </div>
                <div
                  className={`flex items-start gap-3 ${participants[m.sender]._id !== session?.user.id ? "flex-row-reverse" : ""}`}
                >
                  <ProfileImage user={participants[m.sender]} />
                  <div
                    className={`py-2 px-3 rounded-lg shadow-sm break-words ${participants[m.sender]._id === session?.user.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"}`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border px-3 py-2 outline-none"
          placeholder="Type a message..."
          ref={inputRef}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="px-4 py-2 hover:bg-gray-200 transition"
          onClick={sendMessage}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

function AddNewChat() {
  const { data, error, isLoading } = useSWR(
    "/api/chat/available",
    (url: string) => fetch(url).then((res) => res.json()),
  );
  const { push, pop } = useLocalHistory();

  async function startNewChatroom(user: IUser) {
    const res = await fetch("/api/chat/room", {
      method: "PUT",
      body: JSON.stringify({ userId: user._id }),
      headers: { "Content-Type": "application/json" },
    });
    const room: IChatRoom = (await res.json()).room;

    pop();
    push({ name: "chat", params: { id: room._id } });
  }

  if (isLoading) return <p>Fetching users...</p>;
  if (error) return <p>Error loading users</p>;

  const users: IUser[] = data.users;

  return (
    <div className="flex flex-col gap-2">
      {users.length === 0 ? (
        <p>You already chatted to all of them.</p>
      ) : (
        <>
          <h1 className="text-lg font-[450]">Start a new chat!</h1>
          {users.map((u) => (
            <button
              key={(u._id as any).toString()}
              className="px-3 py-2 border flex items-center gap-2 hover:bg-gray-200"
              onClick={() => startNewChatroom(u)}
            >
              <ProfileImage user={u} />
              <div className="flex flex-col text-left">
                <span>{u.name}</span>
                <span className="text-sm text-gray-500">{u.email}</span>
              </div>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

const OverlayShell: React.FC<{
  onClose: () => void;
  openerRef?: React.RefObject<HTMLElement>;
}> = ({ onClose }) => {
  const { current, pop, canGoBack } = useLocalHistory();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const clientRef = useRef<Ably.Realtime | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user.id) {
      return;
    }

    if (!clientRef.current) {
      console.log(session.user.id);
      clientRef.current = new Ably.Realtime({
        authUrl: `/api/chat/ably/token-request`,
        clientId: session?.user.id,
      });
    }
  }, [session?.user.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!clientRef.current) {
    return <p>Connecting to server...</p>;
  }

  return (
    <AblyProvider client={clientRef.current}>
      <div className="fixed bottom-6 right-6 z-50 flex items-end justify-end pointer-events-none">
        <div
          ref={panelRef}
          role="dialog"
          className="pointer-events-auto w-96 max-h-[70vh] bg-white rounded-xl shadow-2xl p-4 border ring-1 ring-black/5 overflow-x-hidden min-h-96"
        >
          <div className="flex items-center justify-between mb-3">
            <button
              className="disabled:text-gray-300 disabled:hover:cursor-default!"
              disabled={!canGoBack()}
              onClick={() => pop()}
            >
              <ArrowLeft />
            </button>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          <div className="overflow-auto">
            {current?.name === "menu" && <Menu />}
            {current?.name === "chat" && (
              <ChannelProvider channelName={current.params?.id}>
                <ChatRoom />
              </ChannelProvider>
            )}
            {current?.name === "add" && <AddNewChat />}
          </div>
        </div>
      </div>
    </AblyProvider>
  );
};

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => setMounted(true), []);

  const openOverlay = () => {
    setOpen(true);
    if (typeof window !== "undefined") {
      window.history.pushState({ __chat_overlay: true, sessionId: "root" }, "");
    }
  };

  const closeOverlay = () => {
    setOpen(false);
    try {
      if (typeof window !== "undefined") window.history.back();
    } catch {}
    openerRef.current?.focus?.();
  };

  return (
    <>
      <button
        ref={openerRef}
        onClick={openOverlay}
        aria-expanded={open}
        aria-controls="chat-overlay"
        className="fixed bottom-6 right-6 z-40 inline-flex items-center justify-center w-14 h-14 rounded-xl text-gray-500 bg-white hover:bg-gray-200 shadow-xl transition"
      >
        <MessageCircleIcon />
      </button>

      {mounted && open
        ? createPortal(
            <LocalHistoryProvider
              initial={[{ name: "menu" }]}
              syncWithBrowser={true}
            >
              <SessionProvider>
                <OverlayShell onClose={closeOverlay} openerRef={openerRef} />
              </SessionProvider>
            </LocalHistoryProvider>,
            document.body,
          )
        : null}
    </>
  );
}
