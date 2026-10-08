"use client";

import { useParams } from "next/navigation";
import TemaBiblioteca from "../TemaBiblioteca";

export default function TemaPage() {
  const params = useParams();

  const temaId = Array.isArray(params.id)
    ? params.id[0]
    : String(params.id ?? "");

  return <TemaBiblioteca temaId={temaId} />;
}