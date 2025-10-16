"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IUser } from "@/model/User";
import { ReactNode, useEffect, useState } from "react";
import { HashLoader } from "react-spinners";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { UserIcon } from "lucide-react";

export function UsersTable() {
  const [users, setUsers] = useState<IUser[]>();
  const [header, setHeader] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/user/admin");
      if (!res.ok) {
        throw new Error(
          `Failed to fetch users ${res.status}: ${(await res.json()).error}`,
        );
      }
      setUsers((await res.json()).users as IUser[]);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users) {
      setHeader(Object.keys(users[0]).map((key) => key));
    }
  }, [users]);

  if (!users) {
    return (
      <div className="flex flex-col gap-5 justify-center items-center min-h-48 my-12">
        <p>Fetching users...</p>
        <HashLoader size={24} />
      </div>
    );
  }

  const customHandler = {
    image: (url: string): ReactNode => (
      <Avatar className="flex justify-center items-center">
        <AvatarImage src={url} />
        <AvatarFallback>
          <UserIcon />
        </AvatarFallback>
      </Avatar>
    ),
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {header.map((h) => (
            <TableHead key={h} className="font-bold">
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u, i) => (
          <TableRow key={i}>
            {header.map((h) => (
              <TableCell key={h}>
                {h in customHandler
                  ? (customHandler as any)[h]((u as any)[h])
                  : (u as any)[h]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
