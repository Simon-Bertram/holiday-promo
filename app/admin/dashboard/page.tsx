import {
  Table,
  TableBody,
  // TableCapion,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSubscribers } from "@/lib/actions";
import Link from "next/link";

export default async function Page() {
  const subscribers = await getSubscribers();

  return (
    <div className="container mx-auto mt-20">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-white text-lg font-bold">Name</TableHead>
            <TableHead className="text-white text-lg font-bold">
              Email
            </TableHead>
            <TableHead className="text-white text-lg font-bold">
              Date created
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.map((subscriber) => (
            <TableRow key={subscriber.id}>
              <TableCell>{subscriber.name}</TableCell>
              <TableCell>{subscriber.email}</TableCell>
              <TableCell>{subscriber.createdAt.toLocaleDateString()}</TableCell>
              <TableCell>
                <Link href="/">
                  <button className="bg-blue-500 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded text-xs">
                    Edit
                  </button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
