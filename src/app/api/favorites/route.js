export const dynamic = "force-dynamic";

export async function POST() {
  return Response.json(
    { error: "Favorites are managed through your authenticated Firebase account." },
    { status: 410 },
  );
}
