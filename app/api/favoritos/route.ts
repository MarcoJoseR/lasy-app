import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("favoritos")
    .select("receita_id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ids = data.map(item => item.receita_id);
  return NextResponse.json({ data: ids });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { receita_id } = body;

    if (!receita_id) {
      return NextResponse.json(
        { error: "receita_id é obrigatório" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("favoritos")
      .insert([{ receita_id }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { receita_id } = body;

    if (!receita_id) {
      return NextResponse.json(
        { error: "receita_id é obrigatório" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("favoritos")
      .delete()
      .eq("receita_id", receita_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
