"use client";

import { IUser } from "@/model/User";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  ArrowLeft,
  Ellipsis,
  MessageCircleIcon,
  Plus,
  RefreshCwIcon,
  Send,
  UserIcon,
  X,
} from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";
import { Avatar } from "./ui/avatar";
import useSWR from "swr";
import {
  IChatMessagePopulated,
  IChatRoom,
  IChatRoomPopulated,
} from "@/model/Chat";
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

function ChatList() {
  const { data, error, isLoading } = useSWR("/api/chat", (url: string) =>
    fetch(url).then((res) => res.json()),
  );
  const { push } = useLocalHistory();
  const { data: session } = useSession();

  function openChat(room: IChatRoomPopulated) {
    push({ name: "chat", params: { id: room._id } });
  }

  if (isLoading) return <p>Fetching users...</p>;
  if (error) return <p>Error loading users</p>;

  const rooms: IChatRoomPopulated[] = data.rooms;

  return (
    <div className="flex flex-col gap-2">
      {rooms.map((r) => {
        return (
          <button
            key={(r._id as any).toString()}
            className="px-3 py-2 border flex items-center gap-2 hover:bg-gray-200"
            onClick={() => openChat(r)}
          >
            {r.participants
              .filter((x) => x.name !== session?.user.name)
              .map((u) => (
                <div
                  key={(u._id as any).toString()}
                  className="flex gap-2 items-center"
                >
                  {renderAvatar(u)}
                  <div className="flex flex-col text-left">
                    <span>{u.name}</span>
                    {r.messages.length !== 0 && (
                      <span className="text-sm text-gray-500">
                        <span>
                          {
                            r.participants[
                              r.messages[r.messages.length - 1].sender
                            ].name
                          }
                          :{" "}
                        </span>
                        <span>{r.messages[r.messages.length - 1].content}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </button>
        );
      })}
    </div>
  );
}

const Menu: React.FC = () => {
  const { push } = useLocalHistory();
  return (
    <div className="space-y-2">
      <h3>Menu</h3>
      <ChatList />
      <div className="flex flex-col gap-2 text-sm">
        <button
          onClick={() => push({ name: "add" })}
          className="flex justify-center items-center gap-2 px-3 py-2 border"
        >
          <Plus />
          <span>New chat</span>
        </button>
      </div>
    </div>
  );
};

const renderAvatar = (sender: IUser) => {
  const initials = (sender?.name || "?")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
      {sender?.image ? (
        <img
          src={sender.image}
          alt={sender.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

const ChatRoom: React.FC = () => {
  const { current } = useLocalHistory();
  const inputRef = useRef<HTMLInputElement>(null);
  const [participants, setParticipants] = useState<IUser[]>([]);
  const [messages, setMessages] = useState<IChatMessagePopulated[]>([]);
  const { data: session } = useSession();
  const [recipientUser, setRecipientUser] = useState<IUser>();
  const { pop } = useLocalHistory();

  async function fetchMessage() {
    try {
      const res = await fetch(`/api/chat?id=${current?.params?.id}`);
      const json: { room: IChatRoomPopulated } = await res.json();
      setMessages(json.room?.messages ?? []);
      setParticipants(json.room.participants);
      console.log(json.room);
      setRecipientUser(
        json.room.participants.find((u) => u._id !== session?.user.id),
      );
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (!current?.params?.id) return;
    fetchMessage();
  }, [current?.params?.id]);

  async function sendMessage() {
    const value = inputRef.current?.value;
    if (!value) return;

    try {
      await fetch("/api/chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatroomId: current?.params?.id,
          content: value,
        }),
      });

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
            {renderAvatar(recipientUser)}
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
                <div className="text-xs text-gray-500 mb-1">
                  {participants[m.sender].name}
                </div>
                <div
                  className={`flex items-center gap-3 ${participants[m.sender]._id !== session?.user.id ? "flex-row-reverse" : ""}`}
                >
                  {renderAvatar(participants[m.sender])}
                  <div
                    className={`py-2 px-3 rounded-lg shadow-sm break-words ${participants[m.sender]._id === session?.user.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"}`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
};

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
      <h1 className="text-lg font-[450]">Start a new chat!</h1>
      {users.map((u) => (
        <button
          key={(u._id as any).toString()}
          className="px-3 py-2 border flex items-center gap-2 hover:bg-gray-200"
          onClick={() => startNewChatroom(u)}
        >
          {renderAvatar(u)}
          <div className="flex flex-col text-left">
            <span>{u.name}</span>
            <span className="text-sm text-gray-500">{u.email}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

const OverlayShell: React.FC<{
  onClose: () => void;
  openerRef?: React.RefObject<HTMLElement>;
}> = ({ onClose, openerRef }) => {
  const { current, pop, canGoBack } = useLocalHistory();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end justify-end pointer-events-none">
      <div
        ref={panelRef}
        role="dialog"
        className="pointer-events-auto w-96 max-h-[70vh] bg-white rounded-xl shadow-2xl p-4 border ring-1 ring-black/5 overflow-hidden"
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
          {current?.name === "chat" && <ChatRoom />}
          {current?.name === "add" && <AddNewChat />}
        </div>
      </div>
    </div>
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
