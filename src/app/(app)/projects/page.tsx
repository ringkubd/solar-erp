"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Project {
  id: number;
  project_no: string;
  name: string;
  type: string;
  status: string;
  start_date: string | null;
  budget: string | null;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/projects").then((res) => {
      setProjects(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Projects</h1>
          <p className="text-muted-foreground mt-1">Manage execution, assignments, and tasks across your sites.</p>
        </div>
        <Link href="/projects/new">
          <Button>Create Project</Button>
        </Link>
      </div>

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24">Loading Projects...</TableCell></TableRow>
            ) : projects.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No active projects found. Start one from a proposal or direct lead!</TableCell></TableRow>
            ) : (
              projects.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-slate-500">{p.project_no}</TableCell>
                  <TableCell className="font-bold">{p.name}</TableCell>
                  <TableCell className="uppercase text-xs tracking-wider">{p.type.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-xs font-semibold capitalize">
                      {p.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/projects/${p.id}`}><Button variant="outline" size="sm">Manage Tasks</Button></Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
