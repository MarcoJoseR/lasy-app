
"use client";

import { useParams } from "next/navigation";
import ItemBiblioteca from "../ItemBiblioteca";

export default function ItemBookDigitalPage() {
  const params = useParams();
  const itemId = String(params.id);

  return <ItemBiblioteca itemId={itemId} />;
}
